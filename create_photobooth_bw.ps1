Add-Type -AssemblyName System.Drawing

Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;

public class PhotoBoothFilter {
    public static Bitmap ApplyVintageBw(Bitmap src) {
        Bitmap dst = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
        BitmapData srcData = src.LockBits(new Rectangle(0, 0, src.Width, src.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        BitmapData dstData = dst.LockBits(new Rectangle(0, 0, dst.Width, dst.Height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

        int bytes = Math.Abs(srcData.Stride) * src.Height;
        byte[] rgbValues = new byte[bytes];
        byte[] resultValues = new byte[bytes];

        System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, rgbValues, 0, bytes);

        for (int i = 0; i < bytes; i += 4) {
            byte b = rgbValues[i];
            byte g = rgbValues[i + 1];
            byte r = rgbValues[i + 2];
            byte a = rgbValues[i + 3];

            // Luminance with flattering portrait skin brightness
            double lum = (0.34 * r + 0.56 * g + 0.10 * b) / 255.0;

            // Filmic S-curve contrast: punchy midtones, rich blacks, glowing whites
            double val;
            if (lum < 0.48) {
                val = Math.Pow(lum / 0.48, 1.5) * 0.48;
            } else {
                val = 0.48 + (1.0 - Math.Pow((1.0 - lum) / 0.52, 1.45)) * 0.52;
            }

            // Slight highlight boost
            val = val * 1.08;
            if (val > 1.0) val = 1.0;
            if (val < 0.0) val = 0.0;

            byte gray = (byte)(val * 255.0);

            resultValues[i] = gray;
            resultValues[i + 1] = gray;
            resultValues[i + 2] = gray;
            resultValues[i + 3] = a;
        }

        System.Runtime.InteropServices.Marshal.Copy(resultValues, 0, dstData.Scan0, bytes);
        src.UnlockBits(srcData);
        dst.UnlockBits(dstData);

        return dst;
    }

    public static GraphicsPath CreateRoundedRectangle(Rectangle rect, int radius) {
        GraphicsPath path = new GraphicsPath();
        int diameter = radius * 2;
        Rectangle arc = new Rectangle(rect.Location, new Size(diameter, diameter));

        // Top Left
        path.AddArc(arc, 180, 90);

        // Top Right
        arc.X = rect.Right - diameter;
        path.AddArc(arc, 270, 90);

        // Bottom Right
        arc.Y = rect.Bottom - diameter;
        path.AddArc(arc, 0, 90);

        // Bottom Left
        arc.X = rect.Left;
        path.AddArc(arc, 90, 90);

        path.CloseFigure();
        return path;
    }
}
'@ -ReferencedAssemblies System.Drawing

$img1Path = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\micaela_1.jpg"
$img2Path = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\micaela_2.jpg"
$img3Path = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\micaela_3.jpg"
$outputPath = "c:\Users\Mica\Documents\GitHub\Portfolio_MicaelaAilenGodoy1\assets\img\hero_photobooth.jpg"

$raw1 = [System.Drawing.Bitmap]::FromFile($img1Path)
$raw2 = [System.Drawing.Bitmap]::FromFile($img2Path)
$raw3 = [System.Drawing.Bitmap]::FromFile($img3Path)

$bw1 = [PhotoBoothFilter]::ApplyVintageBw($raw1)
$bw2 = [PhotoBoothFilter]::ApplyVintageBw($raw2)
$bw3 = [PhotoBoothFilter]::ApplyVintageBw($raw3)

$raw1.Dispose()
$raw2.Dispose()
$raw3.Dispose()

# Canvas Dimensions: High-res vintage strip
$canvasWidth = 900
$canvasHeight = 2600
$photoWidth = 780
$photoHeight = 700
$photoLeft = 60
$photoTop1 = 110
$photoTop2 = 860
$photoTop3 = 1610
$cornerRadius = 16

$bmp = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Background: Warm Vintage Photobooth Paper Tone
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 247, 241))
$g.FillRectangle($bgBrush, 0, 0, $canvasWidth, $canvasHeight)

# Function to draw cropped & rounded image
function DrawRoundedPhoto($graphics, $image, [int]$destX, [int]$destY, [int]$destW, [int]$destH, [double]$yBias = 0.2, [int]$rad = 16) {
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
    
    $path = [PhotoBoothFilter]::CreateRoundedRectangle($destRect, $rad)
    $state = $graphics.Save()
    $graphics.SetClip($path)
    $graphics.DrawImage($image, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Restore($state)

    # Clean border around rounded photo
    $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(35, 30, 32), 2.5)
    $graphics.DrawPath($framePen, $path)
    $path.Dispose()
    $framePen.Dispose()
}

# Draw 3 photos with vintage rounded frames
DrawRoundedPhoto $g $bw1 $photoLeft $photoTop1 $photoWidth $photoHeight 0.25 $cornerRadius
DrawRoundedPhoto $g $bw2 $photoLeft $photoTop2 $photoWidth $photoHeight 0.22 $cornerRadius
DrawRoundedPhoto $g $bw3 $photoLeft $photoTop3 $photoWidth $photoHeight 0.05 $cornerRadius

# Header Text (vintage photobooth style)
$fontHeader = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Courier New", 18, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 35, 40))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(145, 130, 135))

$g.DrawString("015", $fontSub, $textBrush, 60, 48)
$g.DrawString("PHOTO-BOOTH", $fontHeader, $textBrush, 550, 44)

# Footer Typography & Monogram
$fontFooter = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$fontFooterScript = New-Object System.Drawing.Font("Courier New", 16, [System.Drawing.FontStyle]::Bold)

$g.DrawString("MICAELA AILEN GODOY", $fontFooter, $textBrush, 60, 2435)
$g.DrawString("UBA FADU // 2026", $fontFooterScript, $mutedBrush, 600, 2438)

# Save as high-quality JPEG
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]96)

$bw1.Dispose()
$bw2.Dispose()
$bw3.Dispose()

$bmp.Save($outputPath, $encoder, $encoderParams)
$bmp.Dispose()
$g.Dispose()

Write-Output "Photobooth strip refined with rounded frames and high contrast B&W!"
