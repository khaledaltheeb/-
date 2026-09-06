#!/usr/bin/env bash
set -euo pipefail

slugs=(
  apache-ii
  assign-cardiovascular-risk-score
  atlas-cdi-score
  brief-psychiatric-rating-scale-anchored
  chart-short-form
  combat-exposure-scale
  crohns-disease-activity-index-v1
  deployment-risk-resilience-inventory-2
  expanded-disability-status-scale
  expanded-drs-postacute-interview-caregiver
  expanded-drs-postacute-interview-survivor
  framingham-cvd-10-year-risk
  hamilton-depression-rating-scale-24
  international-physical-activity-questionnaire-long-form
  jfk-coma-recovery-scale-revised
  kurtzke-functional-systems-score
  mayo-portland-adaptability-inventory-4
  model-for-end-stage-liver-disease
  modified-van-assche-index
  observer-global-impression
  rey-auditory-verbal-learning-test
  simple-endoscopic-score-crohns-disease-v1
  visual-function-questionnaire-25
)

mapfile -t refs < <(git for-each-ref --format='%(refname)' refs/remotes/origin/ | grep -v '/HEAD$')

for slug in "${slugs[@]}"; do
  echo "=== ${slug} ==="
  found=0
  for ref in "${refs[@]}"; do
    # Skip main because the unresolved coverage audit already established no explicit material there.
    [[ "${ref}" == 'refs/remotes/origin/main' ]] && continue
    matches="$(git grep -l "['\"]${slug}['\"]" "${ref}" -- 'lib/assessment-measure-operational*.ts' 2>/dev/null || true)"
    if [[ -n "${matches}" ]]; then
      found=1
      short="${ref#refs/remotes/origin/}"
      while IFS= read -r match; do
        [[ -z "${match}" ]] && continue
        file="${match#*:}"
        commit="$(git rev-parse "${ref}")"
        merge_base="$(git merge-base origin/main "${ref}" || true)"
        if git merge-base --is-ancestor "${commit}" origin/main 2>/dev/null; then
          relation='already-ancestor'
        elif git merge-base --is-ancestor origin/main "${ref}" 2>/dev/null; then
          relation='branch-ahead-of-main'
        else
          relation='diverged'
        fi
        printf 'MATCH branch=%s file=%s head=%s merge_base=%s relation=%s\n' "${short}" "${file}" "${commit}" "${merge_base}" "${relation}"
      done <<< "${matches}"
    fi
  done
  if [[ "${found}" -eq 0 ]]; then
    echo 'MATCH none'
  fi
  echo
done
