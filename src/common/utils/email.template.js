export const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td align="center" style="background-color:#e8505b;padding:28px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;">Sara7a 😎</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px 36px;color:#333333;">
              <p style="margin:0 0 20px;font-size:15px;">Your confirmation code is</p>
              <span style="display:inline-block;background-color:#f4f4f7;border-radius:8px;padding:14px 28px;font-size:30px;letter-spacing:8px;font-weight:bold;color:#e8505b;">
                ${otp}
              </span>
              <p style="margin:20px 0 0;font-size:13px;color:#777777;">This code expires in 10 minutes.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
