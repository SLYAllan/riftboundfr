$baseUrl = "https://riftdecks.com/riftbound-tournaments/shanghai-national-open-tournament-decks-52"
$outDir = "C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes"
$success = 0
$fail = 0

for ($i = 2; $i -le 32; $i++) {
    $url = "${baseUrl}?page=${i}"
    $outFile = "$outDir\shanghai-no-page${i}.md"
    if (Test-Path $outFile) {
        Write-Host "SKIP page $i (exists)"
        $success++
        continue
    }
    Write-Host "Scraping page $i/32..."
    try {
        firecrawl scrape $url -f markdown --only-main-content -o $outFile
        if (Test-Path $outFile) { $success++ } else { $fail++ }
    } catch {
        Write-Host "FAIL page ${i}: $($_.Exception.Message)"
        $fail++
    }
    Start-Sleep -Seconds 2
}
Write-Host "`nDONE: $success success, $fail fail (pages 2-32)"
