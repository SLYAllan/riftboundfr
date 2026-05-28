$urlFile = Join-Path $PSScriptRoot "..\data\raw-scrapes\bologna-rq-urls.txt"
$outDir = Join-Path $PSScriptRoot "..\data\raw-scrapes\bologna-rq"
$urls = Get-Content $urlFile | Where-Object { $_ -match '\S' }

Write-Host "Bologna RQ: scraping $($urls.Count) decklists..."
$done = 0; $fail = 0

foreach ($url in $urls) {
    $slug = $url -replace '.*/',''
    $outFile = Join-Path $outDir "$slug.md"

    if (Test-Path $outFile) {
        $size = (Get-Item $outFile).Length
        if ($size -gt 500) {
            $done++
            continue
        }
    }

    firecrawl scrape $url -f markdown --only-main-content -o $outFile 2>$null
    Start-Sleep -Seconds 2

    if ((Test-Path $outFile) -and ((Get-Item $outFile).Length -gt 500)) {
        $done++
    } else {
        $fail++
        Write-Host "  FAIL: $slug"
    }

    if (($done + $fail) % 10 -eq 0) {
        Write-Host "  Progress: $done done, $fail failed / $($urls.Count) total"
    }
}

Write-Host "`nComplete: $done scraped, $fail failures out of $($urls.Count)"
