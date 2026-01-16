import subprocess
import time
import requests
import os
import sys
import psutil

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_SERVER_PORT = 8000
BRIDGE_PORT = 8080

def kill_port(port):
    """Kill any process listening on the specified port"""
    for proc in psutil.process_iter():
        try:
            # Check connections for this process
            for conn in proc.connections():
                if conn.laddr.port == port:
                    print(f"killing {proc.name()} on port {port}...")
                    proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

def wait_for_service(url, name, retries=30):
    print(f"Waiting for {name} at {url}...")
    for i in range(retries):
        try:
            requests.get(url)
            print(f"✅ {name} is up!")
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(1)
            print(".", end="", flush=True)
    print(f"\n❌ {name} failed to start.")
    return False

def run_e2e_test():
    print("🚀 Starting End-to-End Test Suite for Prune Juice...")
    
    # 1. Cleanup
    print("\n[1/5] Cleaning up ports...")
    kill_port(PYTHON_SERVER_PORT)
    kill_port(BRIDGE_PORT)

    # 2. Start Python Backend
    print("\n[2/5] Starting Python AI Backend...")
    env = os.environ.copy()
    env["PYTHONPATH"] = PROJECT_ROOT
    
    # We use Shell=True to ensure we can run it easily, but usually directly calling python is safer
    # directing stderr to stdout to catch errors
    python_server = subprocess.Popen(
        [sys.executable, "bridge/python_server.py"],
        cwd=PROJECT_ROOT,
        env=env,
        stdout=subprocess.DEVNULL, # Keep console clean, check logs if fail
        stderr=subprocess.PIPE
    )
    
    if not wait_for_service(f"http://localhost:{PYTHON_SERVER_PORT}/", "Python Backend"):
        print("Python Backend Error Logs:")
        print(python_server.stderr.read().decode())
        python_server.kill()
        return

    # 3. Start Node Bridge
    print("\n[3/5] Starting Node.js Bridge...")
    node_bridge = subprocess.Popen(
        ["node", "bridge/api-server.js"],
        cwd=PROJECT_ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )

    if not wait_for_service(f"http://localhost:{BRIDGE_PORT}/api/queue", "Node Bridge"):
        print("Node Bridge Error Logs:")
        print(node_bridge.stderr.read().decode())
        python_server.kill()
        node_bridge.kill()
        return

    # 4. Run Generation Test
    print("\n[4/5] Sending Generation Request (Lightning Mode)...")
    try:
        payload = {
            "prompt": "E2E Test Run: A futuristic QA robot",
            "style": "lightning", # Uses fast scheduler
            "width": 512, # Small for speed
            "height": 512
        }
        response = requests.post(f"http://localhost:{BRIDGE_PORT}/api/generate", json=payload)
        response.raise_for_status()
        job_data = response.json()
        job_id = job_data['job_id']
        print(f"✅ Job submitted! ID: {job_id}")

        # Poll for completion
        print("Polling for result...")
        for i in range(60): # 60 seconds max
            try:
                r = requests.get(f"http://localhost:{BRIDGE_PORT}/api/job/{job_id}")
                if r.status_code != 200:
                    print(f"Status not 200: {r.status_code}")
                    print(r.text)
                    time.sleep(1)
                    continue
                    
                status_data = r.json()
                status = status_data['status']
                
                if status == 'completed':
                    print("✅ Generation COMPLETED!")
                    result_data = status_data['result']
                    image_url = result_data.get('image_url')
                    print(f"Image URL: {image_url}")
                    
                    # 1. Check if URL is served
                    try:
                        img_res = requests.get(image_url)
                        img_res.raise_for_status()
                        print(f"✅ Image is SERVED correctly at {image_url}")
                    except Exception as e:
                        print(f"❌ Image is NOT served: {e}")
                        raise e

                    # 2. Check file existence on disk (optional but good for testing)
                    filename = os.path.basename(image_url)
                    local_path = os.path.join(PROJECT_ROOT, "outputs", filename)
                    if os.path.exists(local_path):
                         print(f"✅ File exists on disk at: {local_path}")
                    else:
                         print(f"❌ File missing from disk at: {local_path}")
                         raise Exception("File missing on disk")
                    break
                elif status == 'failed':
                    print("❌ Generation FAILED at backend.")
                    raise Exception("Backend reported failure")
            except requests.exceptions.JSONDecodeError:
                print(f"Failed to decode JSON. Raw response: {r.text}")
            
            time.sleep(1)
            print(".", end="", flush=True)
        else:
            print("❌ Timeout waiting for generation.")

    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
    finally:
        # 5. Cleanup
        print("\n[5/5] Shutting down services...")
        python_server.terminate()
        node_bridge.terminate()
        kill_port(PYTHON_SERVER_PORT)
        kill_port(BRIDGE_PORT)
        print("Done.")

if __name__ == "__main__":
    run_e2e_test()
