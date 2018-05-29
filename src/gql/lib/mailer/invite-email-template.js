const dedent = require('dedent')
const { getJobUrl } = require('@nudj/library')

const possessiveCase = (name) => {
  if (name.endsWith('s')) return `${name}'`
  return `${name}'s`
}

const renderJobsRows = (web, company, jobs) => jobs.map(job => {
  const jobUrl = getJobUrl({
    protocol: web.protocol,
    hostname: web.hostname,
    job: job.slug,
    company: company.slug
  })

  return dedent`
    <tr>
      <td style="width:75%"><a href="${jobUrl}">${job.title}</a></td>
      <td style="width:25%; text-align: left;">£${job.bonus}</td>
    </tr>
  `
}).join('')

module.exports = ({ web, senderName, company, jobs }) => dedent`
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
    <body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;"
      bgcolor="#f6f6f6">
      <table class="body-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">
        <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
          <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
          <tr>
            <td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto; text-align: center;"
              valign="top"><br /><img src="https://nudjcms.s3.amazonaws.com/assets/images/social/nudj-sq-profile-alt-sm-no-bg.png" width="50px" /></td>
          </tr>
          <td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;"
            valign="top">
            <div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
              <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;"
                bgcolor="#fff">
                <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                  <td class="content-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; text-align: center; vertical-align: top; margin: 0; padding: 0 0 20px; line-height: 1.5;" valign="top">
                          <h2>Help ${company.name} hire more great people and get rewarded when they do</h2>
                        </td>
                      </tr>
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          <strong>${senderName || 'We\'ve'}</strong> invited you to join the rest of <strong>${company.name}</strong> on nudj! Simply click below to find people from your network who are perfect for ${possessiveCase(company.name)} open roles.
                        </td>
                      </tr>
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;"
                        valign="top">
                          <a href='${web.protocol}://${process.env.HIRE_HOSTNAME}' class="btn-primary" itemprop="url" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; width: 12rem; font-weight: bold; text-align: center; cursor: pointer; display: block; border-radius: 5px; text-transform: capitalize; background-color: #002d72; margin: 0 auto; border-color: #002d72; border-style: solid; border-width: 10px 20px;">Get Started</a>
                        </td>
                      </tr>
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          <h3>Why should you care about nudj?</h3>
                          Referrals are one of the best ways to hire more great people. You also get paid a nice bonus if anyone you refer gets hired. <br /><br />
                          Nudj is a simple tool that makes it easier for you to share job posts with your network. So sign-up and start sharing to be in with a chance of getting the bonus on offer.
                        </td>
                      </tr>
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          <h3>What jobs are ${company.name} currently hiring for?</h3>
                          <table style="width: 100%;">
                            <thead>
                              <tr>
                                <th style="width:75%; font-weight: bold; text-align: left;">Position</th>
                                <th style="width:25%; font-weight: bold; text-align: left;">Bonus</th>
                              </tr>
                            <thead>
                            <tbody>${renderJobsRows(web, company, jobs)}</tbody>
                          </table>
                        </td>
                      </tr>
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          <h3>Got questions?</h3>
                          Visit our <a href="https://help.nudj.co/">help centre</a> or <a href="mailto: help@nudj.co">contact the nudj team.</a>
                        </td>
                      </tr>
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          Best,<br />
                          The nudj team
                        </td>
                      </tr>
                      <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 11px; margin: 0; color: #ABA9A8;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 100px; padding: 0 0 20px;" valign="top">
                          Don’t think you were meant to receive this? <a href="mailto:hello@nudj.co?Subject=Why%20are%20you%20contacting%20me?">Let us know</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </td>
          <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
        </tr>
      </table>
    </body>
  </html>
`.replace(/\r?\n|\r/g, '')
