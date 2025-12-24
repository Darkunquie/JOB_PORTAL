#!/usr/bin/env python3
"""
Comprehensive Codebase Cleanup Script

This script cleans up:
1. Python cache files (__pycache__, *.pyc)
2. Temporary test files
3. Redundant documentation
4. Log files (optional)
5. Build artifacts
"""

import os
import shutil
from pathlib import Path


def remove_pycache(root_dir: Path) -> int:
    """Remove all __pycache__ directories and .pyc files"""
    count = 0

    # Remove __pycache__ directories
    for pycache_dir in root_dir.rglob("__pycache__"):
        try:
            shutil.rmtree(pycache_dir)
            print(f"Removed: {pycache_dir}")
            count += 1
        except Exception as e:
            print(f"Error removing {pycache_dir}: {e}")

    # Remove .pyc files
    for pyc_file in root_dir.rglob("*.pyc"):
        try:
            pyc_file.unlink()
            print(f"Removed: {pyc_file}")
            count += 1
        except Exception as e:
            print(f"Error removing {pyc_file}: {e}")

    return count


def remove_pytest_cache(root_dir: Path) -> int:
    """Remove pytest cache directories"""
    count = 0
    for pytest_cache in root_dir.rglob(".pytest_cache"):
        try:
            shutil.rmtree(pytest_cache)
            print(f"Removed: {pytest_cache}")
            count += 1
        except Exception as e:
            print(f"Error removing {pytest_cache}: {e}")
    return count


def remove_temp_files(root_dir: Path) -> int:
    """Remove temporary files"""
    count = 0
    patterns = ["*.tmp", "*.temp", "*.bak", "*~"]

    for pattern in patterns:
        for temp_file in root_dir.rglob(pattern):
            try:
                temp_file.unlink()
                print(f"Removed: {temp_file}")
                count += 1
            except Exception as e:
                print(f"Error removing {temp_file}: {e}")

    return count


def consolidate_docs(root_dir: Path) -> None:
    """List documentation files for manual review"""
    print("\nDocumentation files found:")
    print("-" * 60)

    doc_files = []
    for md_file in root_dir.glob("*.md"):
        if md_file.is_file():
            doc_files.append(md_file)
            print(f"  - {md_file.name} ({md_file.stat().st_size} bytes)")

    # Script files
    print("\nScript files found:")
    print("-" * 60)
    for script in root_dir.glob("*.py"):
        if script.name not in ["__init__.py"] and script.is_file():
            print(f"  - {script.name} ({script.stat().st_size} bytes)")

    for script in root_dir.glob("*.sh"):
        if script.is_file():
            print(f"  - {script.name} ({script.stat().st_size} bytes)")


def remove_redundant_docs(root_dir: Path) -> int:
    """Remove redundant documentation files (safe list only)"""
    count = 0

    # Files that can be safely removed (duplicates or outdated)
    safe_to_remove = [
        "PRODUCTION_CRITICAL_FIXES_SUMMARY.md",
        "TESTING_REPORT.md",
        "ERROR_ANALYSIS_SUMMARY.md",
        "DATABASE_CLEANUP_SUMMARY.md",
        "BUG_REPORT.md",
        "PRODUCTION_STATUS.md",
        "SECURITY_PRODUCTION_GUIDE.md",  # Consolidated into SECURITY.md
    ]

    for filename in safe_to_remove:
        file_path = root_dir / filename
        if file_path.exists():
            try:
                file_path.unlink()
                print(f"Removed redundant doc: {filename}")
                count += 1
            except Exception as e:
                print(f"Error removing {filename}: {e}")

    return count


def remove_temp_scripts(root_dir: Path) -> int:
    """Remove temporary utility scripts"""
    count = 0

    temp_scripts = [
        "cleanup_test_data.py",
        "generate_secrets.py",
    ]

    for script_name in temp_scripts:
        script_path = root_dir / script_name
        if script_path.exists():
            try:
                script_path.unlink()
                print(f"Removed temp script: {script_name}")
                count += 1
            except Exception as e:
                print(f"Error removing {script_name}: {e}")

    return count


def main():
    """Main cleanup function"""
    print("=" * 60)
    print("CODEBASE CLEANUP SCRIPT")
    print("=" * 60)

    root_dir = Path(__file__).parent
    backend_dir = root_dir / "backend"

    # Track cleanup stats
    stats = {
        "pycache": 0,
        "pytest": 0,
        "temp": 0,
        "docs": 0,
        "scripts": 0,
    }

    # 1. Remove Python cache
    print("\n[1/6] Removing Python cache files...")
    print("-" * 60)
    stats["pycache"] = remove_pycache(backend_dir)

    # 2. Remove pytest cache
    print("\n[2/6] Removing pytest cache...")
    print("-" * 60)
    stats["pytest"] = remove_pytest_cache(backend_dir)

    # 3. Remove temporary files
    print("\n[3/6] Removing temporary files...")
    print("-" * 60)
    stats["temp"] = remove_temp_files(root_dir)

    # 4. Consolidate documentation
    print("\n[4/6] Analyzing documentation...")
    print("-" * 60)
    consolidate_docs(root_dir)

    # 5. Remove redundant documentation
    print("\n[5/6] Removing redundant documentation...")
    print("-" * 60)
    stats["docs"] = remove_redundant_docs(root_dir)

    # 6. Remove temporary scripts
    print("\n[6/6] Removing temporary scripts...")
    print("-" * 60)
    stats["scripts"] = remove_temp_scripts(root_dir)

    # Summary
    print("\n" + "=" * 60)
    print("CLEANUP SUMMARY")
    print("=" * 60)
    print(f"Python cache files removed:     {stats['pycache']}")
    print(f"Pytest cache dirs removed:      {stats['pytest']}")
    print(f"Temporary files removed:        {stats['temp']}")
    print(f"Redundant docs removed:         {stats['docs']}")
    print(f"Temporary scripts removed:      {stats['scripts']}")
    print(f"\nTotal items cleaned:            {sum(stats.values())}")
    print("=" * 60)
    print("\nRecommendations:")
    print("1. Review remaining .md files and consolidate into main docs")
    print("2. Keep only: README.md, DEPLOYMENT.md, SECURITY.md, ARCHITECTURE.md")
    print("3. Remove deploy.sh if deploy-production.sh is preferred")
    print("4. Run 'git status' to review changes before committing")
    print("=" * 60)


if __name__ == "__main__":
    main()
