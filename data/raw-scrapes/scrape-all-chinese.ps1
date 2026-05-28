$ErrorActionPreference = "Continue"

$tournaments = @(
    @{ Name = "guangzhou-ro"; File = "guangzhou-ro-urls.txt" },
    @{ Name = "chongqing-ro"; File = "chongqing-ro-urls.txt" },
    @{ Name = "shanghai-cc"; File = "shanghai-cc-urls.txt" }
)

$baseDir = "C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes"
$total = 0
$success = 0
$errors = @()

foreach ($t in $tournaments) {
    $dir = Join-Path $baseDir $t.Name
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

    $urls = Get-Content (Join-Path $baseDir $t.File) | Where-Object { $_.Trim() -ne "" }
    Write-Host "=== $($t.Name): $($urls.Count) URLs ==="

    foreach ($url in $urls) {
        $total++
        $slug = ($url -split "/")[-1]
        $outFile = Join-Path $dir "$slug.md"

        if (Test-Path $outFile) {
            Write-Host "  SKIP (exists): $slug"
            $success++
            continue
        }

        Write-Host "  [$total] Scraping: $slug"
        try {
            firecrawl scrape $url -f markdown --only-main-content -o $outFile 2>&1 | Out-Null
            if (Test-Path $outFile) {
                $success++
            } else {
                $errors += "$($t.Name)/$slug"
                Write-Host "    FAILED: no output file"
            }
        } catch {
            $errors += "$($t.Name)/$slug"
            Write-Host "    ERROR: $_"
        }
        Start-Sleep -Seconds 2
    }
}

Write-Host "`n=== DONE ==="
Write-Host "Total: $total | Success: $success | Errors: $($errors.Count)"
if ($errors.Count -gt 0) {
    Write-Host "Failed:"
    $errors | ForEach-Object { Write-Host "  $_" }
}
