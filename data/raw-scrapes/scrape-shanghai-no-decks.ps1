$urlFile = "C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes\shanghai-no-urls.txt"
$outDir = "C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes\shanghai-no"
$urls = Get-Content $urlFile
$total = $urls.Count
$success = 0
$fail = 0
$skip = 0

Write-Host "Total URLs: $total"

for ($i = 0; $i -lt $total; $i++) {
    $url = $urls[$i].Trim()
    if (-not $url) { continue }
    $slug = $url -replace '.*/(deck-[^/]+)$', '$1'
    $outFile = "$outDir\${slug}.md"
    if (Test-Path $outFile) {
        $skip++
        continue
    }
    $num = $i + 1
    if ($num % 100 -eq 0) {
        Write-Host "Progress: $num/$total (success=$success, fail=$fail, skip=$skip)"
    }
    try {
        firecrawl scrape $url -f markdown --only-main-content -o $outFile
        if (Test-Path $outFile) { $success++ } else { $fail++ }
    } catch {
        Write-Host "FAIL: $slug"
        $fail++
    }
    Start-Sleep -Seconds 2
}
Write-Host "`nDONE: $success success, $fail fail, $skip skip out of $total"
