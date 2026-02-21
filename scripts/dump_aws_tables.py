#!/usr/bin/env python3
"""Dump all table data from the AWS RDS PostgreSQL database."""

import json
import subprocess
import sys

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("Installing psycopg2-binary...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2
    from psycopg2.extras import RealDictCursor


# --- Config from Terraform / .env ---
AWS_REGION = "eu-west-3"
PROJECT_NAME = "darijalingo"
ENVIRONMENT = "production"
RDS_IDENTIFIER = f"{PROJECT_NAME}-{ENVIRONMENT}-db"
DB_NAME = "darijalingo"
DB_USER = "darija"
DB_PORT = 5432


def get_rds_endpoint():
    """Get the RDS endpoint via AWS CLI."""
    print(f"Fetching RDS endpoint for '{RDS_IDENTIFIER}' in {AWS_REGION}...")
    result = subprocess.run(
        [
            "aws",
            "rds",
            "describe-db-instances",
            "--db-instance-identifier",
            RDS_IDENTIFIER,
            "--region",
            AWS_REGION,
            "--query",
            "DBInstances[0].Endpoint.Address",
            "--output",
            "text",
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Error fetching RDS endpoint: {result.stderr.strip()}")
        sys.exit(1)
    endpoint = result.stdout.strip()
    print(f"RDS endpoint: {endpoint}")
    return endpoint


def get_db_password():
    """Get the DB password from terraform state or prompt."""
    # Try terraform output first
    try:
        result = subprocess.run(
            ["terraform", "output", "-raw", "db_password"],
            capture_output=True,
            text=True,
            cwd="terraform",
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except FileNotFoundError:
        pass

    # Fall back to manual input
    import getpass

    return getpass.getpass("Enter RDS password: ")


def dump_tables(host, password):
    """Connect to PostgreSQL and dump all table data."""
    conn = psycopg2.connect(
        host=host,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=password,
        sslmode="require",
    )

    cur = conn.cursor()

    # Get all public tables
    cur.execute("""
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """)
    tables = [row[0] for row in cur.fetchall()]

    print(f"\nFound {len(tables)} tables: {', '.join(tables)}\n")
    print("=" * 80)

    for table in tables:
        cur.execute(f'SELECT COUNT(*) FROM "{table}";')
        count = cur.fetchone()[0]

        print(f"\n--- {table} ({count} rows) ---")

        if count == 0:
            print("  (empty)")
            continue

        # Get column names
        cur.execute(f'SELECT * FROM "{table}" LIMIT 0;')
        columns = [desc[0] for desc in cur.description]
        print(f"  Columns: {', '.join(columns)}\n")

        # Fetch all rows
        dict_cur = conn.cursor(cursor_factory=RealDictCursor)
        dict_cur.execute(f'SELECT * FROM "{table}" ORDER BY 1;')
        rows = dict_cur.fetchall()
        dict_cur.close()

        for i, row in enumerate(rows):
            # Convert non-serializable types to strings
            clean_row = {
                k: str(v)
                if not isinstance(v, (str, int, float, bool, type(None)))
                else v
                for k, v in row.items()
            }
            print(f"  [{i + 1}] {json.dumps(clean_row, indent=6, default=str)}")

    print("\n" + "=" * 80)
    print("Done.")

    cur.close()
    conn.close()


if __name__ == "__main__":
    host = get_rds_endpoint()
    password = get_db_password()
    dump_tables(host, "uVdGjvVu2ol6dExXp59u")
