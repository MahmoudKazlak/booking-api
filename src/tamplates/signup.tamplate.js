const confirmEmailTemplate = (
  req,
  token,
  firstName = "User",
  company = "Inventory App"
) => {
  //   const baseUrl = `${req.protocol}://${req.headers.host}${process.env.BASEURL}`;
  return `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm Your Email</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }

        .header {
            background-color: #007BFF;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
        }

        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007BFF;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }

        .footer {
            font-size: 13px;
            color: #777777;
            text-align: center;
            padding: 20px;
            background-color: #f1f1f1;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <h1>Confirm Your Email</h1>
        </div>
        <div class="content">
            <p>Hi ${firstName},</p>
            <p>Thanks for signing up for <strong>${company}</strong>! Please confirm your email address to
                complete
                your registration.</p>

            <p style="text-align: center;">
                <a href="${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}"
                    class="button">Confirm My Email</a>
            </p>

            <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
            <p><a href="${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}"
                    style="color:#007BFF;">${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}</a></p>

            <p>If you didn’t sign up, you can safely ignore this email.</p>

            <p>Best regards,<br>
                The Inventory App Team</p>
        </div>
        <div class="footer">
            <p>Inventory App • [Website URL] • [Support Email]</p>
        </div>
    </div>
</body>

</html>
`;
};

export default confirmEmailTemplate;
