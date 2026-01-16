import os
import sys

def validate():
    print("🔍 Validating Prune Juice Fork Integrity...")
    
    checks = {
        "Penpot Directory": "penpot",
        "Fooocus Directory": "Fooocus",
        "Bridge API": "bridge/api-server.js",
        "Python Server": "bridge/python_server.py",
        "Templates": "templates/social-media/instagram-post-product.json"
    }
    
    failed = False
    for name, path in checks.items():
        if os.path.exists(path):
            print(f"✅ {name}: FOUND")
        else:
            print(f"❌ {name}: MISSING at {path}")
            failed = True
            
    if failed:
        print("\n🛑 Integrity Check FAILED. Check your file structure.")
        sys.exit(1)
    else:
        print("\n✨ Integrity Check PASSED. All core components are in place.")

if __name__ == "__main__":
    validate()
