Add-Type -AssemblyName System.Drawing

$img1Path = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\micaela_1.jpg"
$img2Path = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\micaela_2.jpg"
$img3Path = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\micaela_3.jpg"
$outputPath = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\hero_photobooth.jpg"

$img1 = [System.Drawing.Image]::FromFile($img1Path)
$img2 = [System.Drawing.Image]::FromFile($img2Path)
$img3 = [System.Drawing.Image]::FromFile($img3Path)

$canvasWidth = 900
$canvasHeight = 2600
$photoWidth = 800
$photoHeight = 720
$photoLeft = 50
$photoTop1 = 110
$photoTop2 = 880
$photoTop3 = 1650

$bmp = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Background cream / vintage paper
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 245, 238))
$g.FillRectangle($bgBrush, 0, 0, $canvasWidth, $canvasHeight)

# Header Text
$fontHeader = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Courier New", 20, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 11, 36))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 115, 125))

$g.DrawString("015", $fontSub, $textBrush, 50, 42)
$g.DrawString("PHOTO-BOOTH", $fontHeader, $textBrush, 520, 38)

# Function to draw cropped image to fill slot
function DrawCropped($graphics, $image, [int]$destX, [int]$destY, [int]$destW, [int]$destH, [double]$yBias = 0.2) {
    $srcW = $image.Width
    $srcH = $image.Height
    $targetAspect = $destW / $destH
    $srcAspect = $srcW / $srcH

    if ($srcAspect -gt $targetAspect) {
        $cropW = [int]($srcH * $targetAspect)
        $cropH = $srcH
        $cropX = [int](($srcW - $cropW) / 2)
        $cropY = 0
    } else {
        $cropW = $srcW
        $cropH = [int]($srcW / $targetAspect)
        $cropX = 0
        $cropY = [int](($srcH - $cropH) * $yBias)
    }

    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $destW, $destH)
    $graphics.DrawImage($image, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

# Draw 3 photos with black borders
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(25, 12, 18), 3)

# Slot 1: micaela_1 (Focus close-up camera to eye)
DrawCropped $g $img1 $photoLeft $photoTop1 $photoWidth $photoHeight 0.25
$g.DrawRectangle($borderPen, $photoLeft, $photoTop1, $photoWidth, $photoHeight)

# Slot 2: micaela_2 (Medium camera shot with sash)
DrawCropped $g $img2 $photoLeft $photoTop2 $photoWidth $photoHeight 0.22
$g.DrawRectangle($borderPen, $photoLeft, $photoTop2, $photoWidth, $photoHeight)

# Slot 3: micaela_3 (Smiling portrait with diploma cap & camera)
DrawCropped $g $img3 $photoLeft $photoTop3 $photoWidth $photoHeight 0.05
$g.DrawRectangle($borderPen, $photoLeft, $photoTop3, $photoWidth, $photoHeight)

# Bottom Text / Footer Stamp
$fontFooter = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$fontFooterSmall = New-Object System.Drawing.Font("Courier New", 18, [System.Drawing.FontStyle]::Bold)

$g.DrawString("MICAELA AILEN GODOY", $fontFooter, $textBrush, 50, 2425)
$g.DrawString("UBA FADU // 2026", $fontFooterSmall, $mutedBrush, 580, 2428)

# Save as JPEG
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

$img1.Dispose()
$img2.Dispose()
$img3.Dispose()

$bmp.Save($outputPath, $encoder, $encoderParams)
$bmp.Dispose()
$g.Dispose()

Write-Output "Photobooth strip updated cleanly!"
