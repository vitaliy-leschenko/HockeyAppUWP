param(
    [string]$connectedServiceName,
    [string]$appID,
    [string]$binaryPath
)

$connectedServiceDetails = Get-ServiceEndpoint -Context $distributedTaskContext -Name $connectedServiceName
$apiToken = $connectedServiceDetails.Authorization.Parameters.Password

$files = Get-ChildItem -Path $binaryPath -Filter "*.appxupload"

$version = ($files | Select-Object -First 1).BaseName

$version = $version.SubString(0,$version.LastIndexOf("_"))
$version = $version.SubString($version.LastIndexOf("_")+1)

$buildSummaryUrl = "$env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI$env:SYSTEM_TEAMPROJECT/_build#_a=summary&buildId=$env:BUILD_BUILDID"

Write-Host "Create new version: $version"
$create_url = "https://rink.hockeyapp.net/api/2/apps/$appID/app_versions/new"

$repoPath = ""
if ($env:BUILD_REPOSITORY_PROVIDER -eq "TfsGit") {
	if ($env:BUILD_REPOSITORY_NAME -eq $env:SYSTEM_TEAMPROJECT) {
		$repoPath = "$($env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI)_git/$($env:SYSTEM_TEAMPROJECT.Replace(' ', '%20'))"
	} else {
		$repoPath = "$($env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI)$($env:SYSTEM_TEAMPROJECT)/_git/$($env:BUILD_REPOSITORY_NAME.Replace(' ', '%20'))"
	}
}

$response = Invoke-RestMethod -Method POST -Uri $create_url  -Header @{ "X-HockeyAppToken" = $apiToken } -Body @{bundle_version = $version}

$log = "$env:SYSTEM_DEFAULTWORKINGDIRECTORY\HockeyApp.md"
$logContent = "The [$($response.title)]($($response.config_url)) was published successfully to HockeyApp.`r`n`r`nVersion: $version"
Set-Content -Path $log -Value $logContent
Write-Host "##vso[Task.UploadSummary]$log"

$update_url = "https://rink.hockeyapp.net/api/2/apps/$($appID)/app_versions/$($response.id)"

$LF = "`r`n"

$enc = [System.Text.Encoding]::GetEncoding("ISO-8859-1")

$first = $true
$files | %{
    Write-Host "Uploading $($_.Name) ..."
    $fileBin = [IO.File]::ReadAllBytes($_.FullName)
    $fileEnc = $enc.GetString($fileBin)
    $boundary = [System.Guid]::NewGuid().ToString()

    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; content-transfer-encoding: `"base64`"; name=`"ipa`"; filename=`"$($_.Name)`"",
        "",
        $fileEnc,
        "--$boundary",
        "Content-Disposition: form-data; name=`"status`"","","2"
    ) -join $LF

    if ($first) {
        $bodyLines = (
            $bodyLines,
            "--$boundary",
            "Content-Disposition: form-data; name=`"build_server_url`"","",$buildSummaryUrl,
            "--$boundary",
            "Content-Disposition: form-data; name=`"commit_sha`"","",$env:BUILD_SOURCEVERSION,
            "--$boundary",
            "Content-Disposition: form-data; name=`"repository_url`"","",$repoPath
        ) -join $LF
        $first = $false
    }

    $bodyLines = (
        $bodyLines,
        "--$boundary--$LF"
    ) -join $LF

    Invoke-RestMethod `
        -Uri $update_url `
        -Method PUT `
        -Headers @{ "X-HockeyAppToken" = $apiToken } `
        -ContentType "multipart/form-data; boundary=`"$boundary`"" `
        -Body $bodyLines
}
