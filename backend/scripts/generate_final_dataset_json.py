import json
from pathlib import Path

import pandas as pd


def main():
    repo_root = Path(__file__).resolve().parents[2]
    csv_path = repo_root / "dataset" / "processed" / "final_dataset.csv"
    out_path = repo_root / "frontend" / "public" / "final_dataset.json"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    df = pd.read_csv(csv_path)

    # Keep only columns used by the frontend.
    # Frontend expects: state, district, crop, season, area, monthly_rainfall, and a fallback annual rainfall.
    # The provided dataset may only include monthly_rainfall, so we derive Annual_Rainfall from it.
    expected = {"state", "district", "crop", "season", "area", "monthly_rainfall"}


    # Some datasets may have capitalized variants.
    col_map = {}
    lower_to_actual = {c.lower(): c for c in df.columns}
    for k in expected:
        if k in df.columns:
            col_map[k] = k
        elif k.lower() in lower_to_actual:
            col_map[k] = lower_to_actual[k.lower()]

    missing = expected.difference(set(col_map.keys()))
    if missing:
        raise ValueError(f"Missing required columns in CSV: {sorted(missing)}; found={list(df.columns)}")

    out_df = df[[col_map[c] for c in expected]].copy()
    out_df.columns = list(expected)

    # Ensure strings where appropriate.
    for c in ["state", "district", "crop", "season"]:
        out_df[c] = out_df[c].astype(str)

    # Numeric columns.
    for c in ["area", "monthly_rainfall"]:
        out_df[c] = pd.to_numeric(out_df[c], errors="coerce")

    # Frontend uses Annual_Rainfall as a fallback; provide it even if the CSV doesn't contain it.
    out_df["Annual_Rainfall"] = out_df["monthly_rainfall"]


    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_df.to_json(out_path, orient="records", indent=2)
    print(f"Wrote {len(out_df)} rows -> {out_path}")


if __name__ == "__main__":
    main()

