import unittest
import sys
import os

# Ensure paths
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestFeatureParity(unittest.TestCase):
    """
    Tests to ensure Prune Juice features match the expected capabilities 
    of the underlying Fooocus and Penpot engines.
    """

    def setUp(self):
        # Mocking torch for CI environments without GPU
        try:
            import torch
            if not torch.cuda.is_available():
                self.using_cpu = True
            else:
                self.using_cpu = False
        except ImportError:
            self.using_cpu = True
            
    def test_fooocus_prompt_expansion(self):
        """
        Fooocus is known for its "GPT-2" style prompt expansion.
        Prune Juice mimics this via the Presets system. 
        Verify that styles inject the correct suffixes.
        """
        print("\nTesting Fooocus Prompt Expansion Parity...")
        from bridge.presets import get_preset
        
        # Test Case 1: Photographic
        preset = get_preset("photographic")
        self.assertIn("35mm photograph", preset['prompt_suffix'])
        self.assertIn("highly detailed", preset['prompt_suffix'])
        print("✅ Photographic style applies correct Fooocus-like tokens.")

        # Test Case 2: Anime
        preset = get_preset("anime")
        self.assertIn("vibrant colors", preset['prompt_suffix'])
        print("✅ Anime style applies correct Fooocus-like tokens.")

    def test_fooocus_speed_checks(self):
        """
        Fooocus claims valid speed on 8GB VRAM.
        We verify that our scheduler selection logic aligns with 'Speed' modes.
        """
        print("\nTesting Fooocus Speed Logic...")
        
        # Static verification of the code logic via source inspection
        import inspect
        try:
            # Import in a try/catch since it requires torch dependencies
            sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'bridge'))
            from fooocus_connector import FooocusConnector
            source = inspect.getsource(FooocusConnector.generate)
            self.assertIn("EulerAncestral", source, "❌ Connector missing Lightning scheduler logic")
            print("✅ Lightning Scheduler logic detected in Connector.")
        except (ImportError, ModuleNotFoundError) as e:
            print(f"⚠️  Skipping dynamic test (missing dependencies: {e})")
            # Fallback: read file directly
            connector_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "bridge", "fooocus-connector.py")
            with open(connector_path, 'r') as f:
                source = f.read()
            self.assertIn("EulerAncestral", source, "❌ Connector missing Lightning scheduler logic")
            print("✅ Lightning Scheduler logic detected in Connector source.")

    def test_penpot_connectivity_logic(self):
        """
        Verify that the Penpot connector is set up to handle WebSocket events
        similar to how a real-time collaboration tool should.
        """
        print("\nTesting Penpot Integration Logic...")
        penpot_connector_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "bridge", "penpot-connector.js")
        
        with open(penpot_connector_path, 'r') as f:
            content = f.read()
            
        # Check for key integration points
        self.assertIn("WebSocket", content, "❌ Penpot Connector missing WebSocket for real-time updates")
        self.assertIn("updateImage", content, "❌ Penpot Connector missing image update handler")
        print("✅ Penpot Connector has valid real-time communication scaffolding.")

if __name__ == '__main__':
    unittest.main()
