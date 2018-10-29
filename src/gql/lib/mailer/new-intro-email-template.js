const dedent = require('dedent')

module.exports = ({ hire, person, job }) => dedent`
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">

  <head>
  <meta name="viewport" content="width=device-width" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <style type="text/css">
    img {
      max-width: 100%;
    }
    body {
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
      width: 100% !important;
      height: 100%;
      line-height: 1.6em;
      background-color: #ececeb;
    }
    hr {
      border: none;
      border-top: 1px solid #DDD;
      border-bottom: 0;
      margin: 10px 30% 10px 30%;
    }
    @media only screen and (max-width: 640px) {
      body {
        padding: 0 !important;
      }
      h1 {
        font-weight: 800 !important;
        margin: 20px 0 5px !important;
      }
      h2 {
        font-weight: 800 !important;
        margin: 20px 0 5px !important;
      }
      h3 {
        font-weight: 800 !important;
        margin: 20px 0 5px !important;
      }
      h4 {
        font-weight: 800 !important;
        margin: 20px 0 5px !important;
      }
      h1 {
        font-size: 22px !important;
      }
      h2 {
        font-size: 18px !important;
      }
      h3 {
        font-size: 16px !important;
      }
      .title {
        text-align: center;
      }
      .container {
        padding: 0 !important;
        width: 100% !important;
      }
      .content {
        padding: 0 !important;
      }
      .content-wrap {
        padding: 10px !important;
      }
      .invoice {
        width: 100% !important;
      }
    }
  </style>
  </head>

  <body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;"
  bgcolor="#f6f6f6">
  <table class="body-wrap" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">
    <td class="container" width="600" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
      <div class="content" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
        <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;"
          bgcolor="#fff">
          <tr style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
            <td class="content-wrap" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">
              <table cellpadding="0" cellspacing="0" style="background: #ffffff; border: 0; border-radius: 0; width: 100%; ">
                <tbody>
                  <tr>
                    <td align="center" style="padding: 10px 10px 20px 20px;">
                      <table cellpadding="0" cellspacing="0" dir="ltr" style="border: 0; width: 100%;">
                        <tbody>
                          <tr>
                            <td class="" align="center" valign="top" style="width: 103px; height: 50px;">
                              <table cellpadding="0" cellspacing="0" dir="ltr" style="border: 0; width: 100%; ">
                                <tbody>
                                  <tr>
                                    <td class="" style="padding: 0; text-align: left; ">
                                      <a href="https://nudj.co" style="text-decoration: none; " universal="true" target="_blank">
                                          <img src="https://nudjcms.s3.amazonaws.com/assets/images/social/nudj-sq-profile-alt-sm-no-bg.png" style="border: 0; height: auto;  max-width: 40px; vertical-align: middle; display: inline-block;" width="103">
                                        </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table cellpadding="0" cellspacing="0" dir="ltr" style="border: 0; width: 100%; ">
                <tbody>
                  <tr>
                    <td style="padding: 20px 35px; text-align: center;">
                      <img alt="nudj - Help your company find more great people to hire and get rewarded when they do!" class="" src="https://nudjcms.s3.amazonaws.com/assets/images/social/review-the-best-img.png" style="border: 0; height: auto;  max-width: 100%; vertical-align: middle; " width="350">
                    </td>
                  </tr>
                </tbody>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                <tr style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                  <td class="content-block" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Hello ${person.firstName},
                  </td>
                </tr>
                <tr style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                  <td class="content-block" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    You’ve just received a new intro for the ${job.title} position! Log in to nudj now to check them out.
                  </td>
                </tr>
                <tr style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                  <td class="content-block" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Make sure you message the candidate quickly if you’re interested in their profile, they might not hang around for long.
                  </td>
                </tr>
                <tr style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                  <td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    <a href='${hire.protocol}://${hire.hostname}/intros#${job.slug}' class="btn-primary" itemprop="url" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; width: 12rem; font-weight: bold; text-align: center; cursor: pointer; display: block; border-radius: 5px; background-color: #002d72; margin: 0 auto; border-color: #002d72; border-style: solid; border-width: 10px 20px;">View intros</a>
                  </td>
                </tr>
                <tr style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                  <td class="content-block" style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Thanks,<br /> The nudj team
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </td>
    <td style="font-family: sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
    </tr>
  </table>
  </body>

  </html>
`.replace(/\r?\n|\r/g, '')
