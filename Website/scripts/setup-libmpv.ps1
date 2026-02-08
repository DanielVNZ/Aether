$ErrorActionPreference = "Stop"

function Resolve-7Zip {
  $cmd = Get-Command "7z" -ErrorAction SilentlyContinue
  $candidates = @(
    ($cmd.Source),
    "$env:ProgramFiles\7-Zip\7z.exe",
    "$env:ProgramFiles(x86)\7-Zip\7z.exe",
    "$env:LocalAppData\Programs\7-Zip\7z.exe",
    "$env:UserProfile\scoop\apps\7zip\current\7z.exe"
  )

  foreach ($path in $candidates) {
    if ($path -and (Test-Path $path)) {
      return $path
    }
  }
  return $null
}

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
  }
}

function Download-File {
  param([string]$Url, [string]$OutFile)
  Write-Host "Downloading $Url"
  Invoke-WebRequest -Uri $Url -OutFile $OutFile
}

$root = Resolve-Path "$PSScriptRoot\.."
$tauriLib = Join-Path $root "src-tauri\lib"
$devLib = $root

Ensure-Dir $tauriLib

$wrapperRelease = Invoke-RestMethod "https://api.github.com/repos/nini22P/libmpv-wrapper/releases/latest"
$wrapperAsset = $wrapperRelease.assets | Where-Object { $_.name -eq "libmpv-wrapper-windows-x86_64.zip" } | Select-Object -First 1
if (-not $wrapperAsset) {
  Write-Error "Could not find libmpv-wrapper-windows-x86_64.zip in libmpv-wrapper releases."
}

$mpvAsset = $null
$mpvOverride = $env:MPV_DEV_LGPL_URL
if ($mpvOverride) {
  $mpvAsset = [PSCustomObject]@{
    name = [System.IO.Path]::GetFileName($mpvOverride)
    browser_download_url = $mpvOverride
  }
} else {
  $mpvReleases = Invoke-RestMethod "https://api.github.com/repos/zhongfly/mpv-winbuild/releases"
  foreach ($release in $mpvReleases) {
    $mpvAsset = $release.assets | Where-Object { $_.name -match "^mpv-dev-lgpl-.*x86_64.*\\.7z$" -and $_.name -notmatch "v3" } | Select-Object -First 1
    if ($mpvAsset) { break }
  }
}
if (-not $mpvAsset) {
  Write-Error "Could not find mpv-dev-lgpl-*-x86_64.7z in recent zhongfly/mpv-winbuild releases. Set MPV_DEV_LGPL_URL to a direct download URL."
}

$temp = Join-Path $env:TEMP "aether-libmpv"
Ensure-Dir $temp

$wrapperZip = Join-Path $temp $wrapperAsset.name
$mpv7z = Join-Path $temp $mpvAsset.name

Download-File $wrapperAsset.browser_download_url $wrapperZip
Download-File $mpvAsset.browser_download_url $mpv7z

Write-Host "Extracting wrapper..."
Expand-Archive -Path $wrapperZip -DestinationPath $temp -Force

$sevenZip = Resolve-7Zip
if (-not $sevenZip) {
  Write-Error "7-Zip not found. Install 7-Zip or add 7z.exe to PATH, then re-run this script."
}
$sevenZip = (Resolve-Path -LiteralPath $sevenZip).Path
Write-Host "Extracting libmpv..."
$args = @("x", $mpv7z, "-o$temp\mpv", "-y")
$proc = Start-Process -FilePath $sevenZip -ArgumentList $args -NoNewWindow -PassThru -Wait
if ($proc.ExitCode -ne 0) {
  Write-Error "7-Zip failed with exit code $($proc.ExitCode)."
}

$wrapperDll = Get-ChildItem $temp -Recurse -Filter "libmpv-wrapper.dll" | Select-Object -First 1
if (-not $wrapperDll) {
  Write-Error "libmpv-wrapper.dll not found after extraction."
}

$libmpvDll = Get-ChildItem "$temp\mpv" -Recurse -Filter "libmpv-2.dll" | Select-Object -First 1
if (-not $libmpvDll) {
  Write-Error "libmpv-2.dll not found in mpv archive."
}

Write-Host "Copying DLLs to dev and build locations..."
Copy-Item $wrapperDll.FullName (Join-Path $devLib "libmpv-wrapper.dll") -Force
Copy-Item $libmpvDll.FullName (Join-Path $devLib "libmpv-2.dll") -Force
Copy-Item $wrapperDll.FullName (Join-Path $tauriLib "libmpv-wrapper.dll") -Force
Copy-Item $libmpvDll.FullName (Join-Path $tauriLib "libmpv-2.dll") -Force

Write-Host "Done. Restart 'npm run tauri dev'."
