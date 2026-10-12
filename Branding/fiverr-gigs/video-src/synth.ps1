param([string]$ScriptJson, [string]$OutDir, [string]$Voice = 'Microsoft Zira Desktop', [int]$Rate = -1)
Add-Type -AssemblyName System.Speech
$items = Get-Content -Raw -Encoding UTF8 $ScriptJson | ConvertFrom-Json
New-Item -ItemType Directory -Force $OutDir | Out-Null
foreach ($it in $items) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SelectVoice($Voice)
  $s.Rate = $Rate
  $s.Volume = 100
  $fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
  $path = Join-Path $OutDir ($it.id + '.wav')
  $s.SetOutputToWaveFile($path, $fmt)
  $s.Speak($it.text)
  $s.Dispose()
  $len = (Get-Item $path).Length
  Write-Output ("{0} {1:N2}s" -f $it.id, (($len - 44) / 88200.0))
}
