$ErrorActionPreference='Stop'
node tools/voice-build/generate-places.mjs
if($LASTEXITCODE -ne 0){throw 'Voice completion failed'}
npm run check *> qa/places-vehicles-2/syntax.log
if($LASTEXITCODE -ne 0){throw 'Source checks failed; see syntax.log'}
npm run check:places-vehicles *> qa/places-vehicles-2/regression.log
if($LASTEXITCODE -ne 0){throw 'Batch checks failed; see regression.log'}
node tools/verify-places-review-http.mjs
if($LASTEXITCODE -ne 0){throw 'Local HTTP review failed'}
$report=@{status='passed';date=[DateTime]::UtcNow.ToString('o');commands=@('npm run check','npm run check:places-vehicles','node tools/verify-places-review-http.mjs');scope='Source, geometry, state, UI/Audio/rendering doubles and local HTTP. No live browser, listening or device certification.'}
[IO.File]::WriteAllText((Join-Path (Get-Location) 'qa/places-vehicles-2/final-checks.json'),($report | ConvertTo-Json -Depth 5),[Text.UTF8Encoding]::new($false))
node tools/finalize-places-2.mjs
if($LASTEXITCODE -ne 0){throw 'Final status gate failed'}
node tools/checkpoint-places-2-final.mjs
if($LASTEXITCODE -ne 0){throw 'Final checkpoint failed'}
Write-Output 'BATCH 2 FINAL CHECKS, STATUS AND CHECKPOINT COMPLETE'
