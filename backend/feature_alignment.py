from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd


def align_features(model: Any, input_row: Dict[str, Any]) -> pd.DataFrame:
    """Align input features to the column names used during model fit.

    The sklearn error you hit is:
    "The feature names should match those that were passed during fit."

    For many sklearn models, the expected columns are stored in:
      - model.feature_names_in_

    This function:
      1) Builds a single-row DataFrame from input_row.
      2) Reorders/selects columns to match model.feature_names_in_.
      3) Fills missing expected columns with 0.
      4) Ignores any extra input columns not expected by the model.
    """

    df = pd.DataFrame([input_row])

    expected: List[str] | None = getattr(model, "feature_names_in_", None)
    if not expected:
        # If the model doesn't expose feature names, return as-is.
        return df

    # Reindex will:
    # - reorder columns
    # - add missing columns with NaN
    # - drop extra columns
    df_aligned = df.reindex(columns=expected)
    df_aligned = df_aligned.fillna(0)
    return df_aligned

