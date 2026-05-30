from pathlib import Path

import yaml


def test_kubernetes_manifests_are_valid_yaml():
    manifest_dir = Path("infra/k8s")

    files = sorted(manifest_dir.glob("*.yaml"))

    assert len(files) >= 8
    for path in files:
        documents = list(yaml.safe_load_all(path.read_text()))
        assert all(document for document in documents)
        assert all("kind" in document for document in documents)
