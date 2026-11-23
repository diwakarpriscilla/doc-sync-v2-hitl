# Requires Git and resets the demo workspace to the demo-baseline tag.
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

git rev-parse --verify demo-baseline *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Required Git tag 'demo-baseline' was not found."
}

$currentBranch = git symbolic-ref --short HEAD
Write-Host "Resetting $currentBranch to demo-baseline..."

git reset --hard demo-baseline
if ($LASTEXITCODE -ne 0) {
    throw "Git reset to demo-baseline failed."
}

$booksPath = Join-Path $repoRoot "bookstore-web-app\data\books.json"
$readmePath = Join-Path $repoRoot "README.md"

if (-not (Test-Path $booksPath)) {
    throw "Baseline reset did not restore bookstore-web-app/data/books.json."
}
if (-not (Test-Path $readmePath)) {
    throw "Baseline reset did not restore README.md."
}

Write-Host "Demo reset complete."
Write-Host "Repository: demo-baseline"
Write-Host "Restored: README.md"
Write-Host "Restored: bookstore-web-app/data/books.json"
