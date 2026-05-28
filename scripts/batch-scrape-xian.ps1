$ErrorActionPreference = "Continue"
$rawDir = "C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes\s3-xian-regional-open"
$urlFile = "C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes\s3-xian-remaining-urls.txt"
$logFile = "C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes\scrape-progress.log"

$urls = Get-Content $urlFile | Where-Object { $_.Trim() -ne "" }
$total = $urls.Count
$success = 0
$fail = 0
$skip = 0

"Starting scrape of $total decks at $(Get-Date)" | Out-File -Encoding utf8 $logFile

for ($i = 0; $i -lt $total; $i++) {
    $url = $urls[$i].Trim()
    $slug = $url -replace '.*/',''
    $outFile = Join-Path $rawDir "$slug.md"

    if (Test-Path $outFile) {
        $skip++
        continue
    }

    try {
        $result = & firecrawl scrape $url -f markdown --only-main-content -o $outFile 2>&1
        if (Test-Path $outFile) {
            $fileSize = (Get-Item $outFile).Length
            if ($fileSize -gt 100) {
                $success++
            } else {
                Remove-Item $outFile -Force
                $fail++
                "FAIL (empty): $slug" | Out-File -Encoding utf8 -Append $logFile
            }
        } else {
            $fail++
            "FAIL (no file): $slug" | Out-File -Encoding utf8 -Append $logFile
        }
    } catch {
        $fail++
        "FAIL (error): $slug - $_" | Out-File -Encoding utf8 -Append $logFile
    }

    if (($i + 1) % 10 -eq 0) {
        $pct = [math]::Round(($i + 1) / $total * 100, 1)
        "Progress: $($i+1)/$total ($pct%) - OK:$success FAIL:$fail SKIP:$skip" | Out-File -Encoding utf8 -Append $logFile
        "Progress: $($i+1)/$total ($pct%) - OK:$success FAIL:$fail SKIP:$skip"
    }

    Start-Sleep -Seconds 2
}

"DONE at $(Get-Date): $success success, $fail fail, $skip skip out of $total" | Out-File -Encoding utf8 -Append $logFile
"DONE: $success success, $fail fail, $skip skip out of $total"
