import click
import json
import psycopg2
from rich.console import Console
from rich.table import Table

console = Console()


@click.group()
def cli():
    """Snapshot and diff PostgreSQL database schemas."""
    pass


@cli.command()
@click.option('--dsn', required=True, envvar='DBSNAP_DSN', help='PostgreSQL connection string')
@click.option('--output', default='snapshot.json', help='Output file path')
def snapshot(dsn, output):
    """Take a snapshot of the current schema."""
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
    """)
    rows = cur.fetchall()
    schema = {}
    for table, col, dtype, nullable in rows:
        schema.setdefault(table, []).append({'column': col, 'type': dtype, 'nullable': nullable})
    with open(output, 'w') as f:
        json.dump(schema, f, indent=2)
    console.print(f"[green]Snapshot saved to {output}[/green]")
    conn.close()


@cli.command()
@click.argument('snapshot_a')
@click.argument('snapshot_b')
def diff(snapshot_a, snapshot_b):
    """Compare two schema snapshots and show changes."""
    with open(snapshot_a) as f:
        a = json.load(f)
    with open(snapshot_b) as f:
        b = json.load(f)

    table = Table(title="Schema Diff")
    table.add_column("Change", style="bold")
    table.add_column("Table")
    table.add_column("Column")
    table.add_column("Detail")

    for tbl in set(list(a.keys()) + list(b.keys())):
        if tbl not in a:
            table.add_row("[green]ADDED TABLE[/green]", tbl, "", "")
        elif tbl not in b:
            table.add_row("[red]DROPPED TABLE[/red]", tbl, "", "")

    console.print(table)


if __name__ == '__main__':
    cli()
