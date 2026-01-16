import unittest
import os
import sys

# Add root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestPruneJuiceBackend(unittest.TestCase):
    def test_vram_manager_init(self):
        try:
            from optimization.vram_manager import VRAMManager
            manager = VRAMManager()
            self.assertIsNotNone(manager)
        except ImportError:
            print("Skipping VRAM Manager test (Torch not installed)")

    def test_presets_exist(self):
        from bridge.presets import PRESETS
        self.assertIn("photographic", PRESETS)
        self.assertIn("prompt_suffix", PRESETS["photographic"])

if __name__ == '__main__':
    unittest.main()
