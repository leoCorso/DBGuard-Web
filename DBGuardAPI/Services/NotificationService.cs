using System.Text;
using System.Text.Json;
using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.GuardNotifications;
using DBGuardAPI.Data.Models.NotificationProviders;
using DBGuardAPI.Data.Models.NotificationTransactions;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Helpers;
using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using MimeKit;

namespace DBGuardAPI.Services
{
    public class NotificationService
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<NotificationService> _logger;
        private readonly CredentialProtector _credentialProtector;
        private readonly IHttpClientFactory _httpClientFactory;
        public NotificationService(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<NotificationService> logger, CredentialProtector credentialProtector, IHttpClientFactory httpClientFactory)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _credentialProtector = credentialProtector;
            _httpClientFactory = httpClientFactory;
        }
        public async Task ProcesNotifications(List<GuardNotification> notifications, Guard guard, GuardChangeTransaction guardChange, string? message = null)
        {
            foreach(GuardNotification notification in notifications) 
            {
                switch (notification)
                {
                    case EmailNotification emailNotification:
                        await SendEmailNotification(emailNotification, guard, guardChange);
                        break;
                    case HTTPNotification httpNotification:
                        await SendHttpNotification(httpNotification, guard, guardChange);
                        break;
                    default:
                        throw new NotImplementedException();
                }
            }
        }
        private async Task SendEmailNotification(EmailNotification notification, Guard guard, GuardChangeTransaction guardChange)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            NotificationProvider? provider = await context.NotificationProviders.FindAsync(notification.NotificationProviderId);
            if(provider is null)
            {
                _logger.LogError("A notification was processed that had a non-existing notification provider {NotificationId} {ProviderId}", notification.Id, notification.NotificationProviderId);
                return;
            }
            if(provider is not EmailProvider emailProvider)
            {
                _logger.LogError("An email notification was processed where its provider was not of type EmailProvider {NotificationId} {ProviderId}", notification.Id, provider.Id);
                return;
            }
            MimeMessage email = new();
            email.From.Add(new MailboxAddress("DBGuard", emailProvider.SenderEmail));
            foreach(string toEmail in notification.ToEmails)
            {
                email.To.Add(MailboxAddress.Parse(toEmail));
            }
            foreach (string ccEmail in notification.CCEmails)
            {
                email.Cc.Add(MailboxAddress.Parse(ccEmail));
            }
            foreach (string bcc in notification.BCCEmails)
            {
                email.To.Add(MailboxAddress.Parse(bcc));
            }
            email.Subject = $"[{guard.GuardState.ToString()}] {notification.EmailSubject}";
            string guardStateColor = GuardStateColorMapper.Map(guardChange.GuardState);


            string changeMessageElement = !string.IsNullOrWhiteSpace(guardChange.Message) ? $"""
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                          <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Change message</td>
                          <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;"> {guardChange.Message}</td>
                        </tr>
                    """ : "";
            string triggerValueElement = guardChange.TriggeredValue is not null ? $"""
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Triggered value</td>
                            <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;"> {guardChange.TriggeredValue?.ToString()}</td>
                        </tr>
                """
                : "";

            BodyBuilder bodyBuilder = new()
            {
                HtmlBody =
$$"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding: 30px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e; padding: 24px 32px;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; letter-spacing:1px;">DBGuard</h1>
              <p style="margin:6px 0 0; color:#a0a0c0; font-size:13px;">Automated Alert System</p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background-color:#fff3cd; border-left: 4px solid #e53935; padding: 14px 32px;">
              <p style="margin:0; color:#7a4100; font-size:14px;">
                ⚠️ <strong>Guard Status Changed</strong> — This is an automated notification from DBGuard.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">

              <h2 style="margin: 0 0 16px; color:#1a1a2e; font-size:16px; text-transform:uppercase; letter-spacing:0.5px; border-bottom: 2px solid #e8e8e8; padding-bottom: 8px;">Guard Details</h2>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td width="40%" style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Guard Name</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{guard.GuardName ?? "Un-named"}}</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Timestamp</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{DateTimeOffset.UtcNow:yyyy-MM-dd HH:mm:ss}} UTC</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Guard State</td>
                  <td style="padding: 10px 0; vertical-align:top;">
                    <span style="display:inline-block; background-color:{{guardStateColor}}; color:white; font-size:12px; font-weight:bold; padding: 3px 10px; border-radius:12px;">
                      {{guard.GuardState}}
                    </span>
                  </td>
                </tr>

                 <!-- Add change message if it exists -->
                {{ changeMessageElement }}
                
                <!-- Add trigger value  -->
                {{ triggerValueElement }}

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Expression</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top; font-family: monospace;">{{guard.TriggerColumn}} {{guard.TriggerOperator}} {{guard.TriggerValue}}</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Database Endpoint</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{guard.DatabaseConnection!.EndPoint}}</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Database</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{guard.DatabaseConnection.DatabaseName}}</td>
                </tr>

                <tr>
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Database Engine</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{guard.DatabaseConnection.DatabaseEngine}}</td>
                </tr>

              </table>

              <!-- Query Block -->
              <h2 style="margin: 24px 0 10px; color:#1a1a2e; font-size:16px; text-transform:uppercase; letter-spacing:0.5px; border-bottom: 2px solid #e8e8e8; padding-bottom: 8px;">Trigger Query</h2>
              <div style="background-color:#f8f8f8; border: 1px solid #e0e0e0; border-radius:4px; padding: 12px 16px; font-family: monospace; font-size:13px; color:#333333; word-break:break-all;">
                {{guard.TriggerQuery}}
              </div>

              <!-- Message Block -->
              <h2 style="margin: 24px 0 10px; color:#1a1a2e; font-size:16px; text-transform:uppercase; letter-spacing:0.5px; border-bottom: 2px solid #e8e8e8; padding-bottom: 8px;">Guard Message</h2>
              <p style="margin:0; color:#444444; font-size:14px; line-height:1.6;">
                {{notification.EmailBody}}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f8f8; padding: 16px 32px; border-top: 1px solid #e8e8e8;">
              <p style="margin:0; color:#999999; font-size:12px; text-align:center;">
                This is an automated message from DBGuard. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
"""
            };
            email.Body = bodyBuilder.ToMessageBody();
            EmailNotificationTransaction emailTransaction = new()
            {
                Timestamp = DateTimeOffset.UtcNow,
                GuardId = guard.Id,
                GuardNotificationId = notification.Id,
                NotificationType = NotificationType.Email,
                GuardChangeTransactionId = guardChange.Id,
                EmailSubject = notification.EmailSubject,
                EmailBody = notification.EmailBody,
                ToEmails = notification.ToEmails,
                CCEmails = notification.CCEmails,
                BCCEmails = notification.BCCEmails
            };
            try
            {
                SmtpClient smtp = new();
                string decryptedPassword = _credentialProtector.Decrypt(emailProvider.Password);
                await smtp.ConnectAsync(emailProvider.SMTPServer, emailProvider.Port, false);
                await smtp.AuthenticateAsync(emailProvider.Username, decryptedPassword);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                emailTransaction.Successful = true;
                _logger.LogInformation("An email notification was sent {NotificationId}", notification.Id);
            }
            catch (Exception ex)
            {
                emailTransaction.Successful = false;
                emailTransaction.ErrorMessage = ex.Message;
                _logger.LogError(ex, "An email notification failed {NotificationId}", notification.Id);
            }

            await context.NotificationTransactions.AddAsync(emailTransaction);
            await context.SaveChangesAsync();
        }
    
        public async Task TestEmailProviderAsync(string server, int port, string username, string password)
        {
            SmtpClient smtp = new();
            await smtp.ConnectAsync(server, port, false);
            await smtp.AuthenticateAsync(username, password);
            await smtp.DisconnectAsync(true);
            _logger.LogInformation("Test email notification provider {Host} {Port} {Username}", server, port, username);
        }
        public async Task TestNotificationAsync(GuardNotification notification)
        {
            switch (notification)
            {
                case EmailNotification emailNotification when emailNotification.NotificationProvider is EmailProvider emailProvider:
                    await TestEmailNotification(emailNotification, emailProvider);
                    break;
                case HTTPNotification httpNotification when httpNotification.NotificationProvider is HTTPProvider httpProvider:
                    await TestHttpNotification(httpNotification, httpProvider);
                    break;
                default:
                    throw new NotSupportedException();
            }
        }
        private async Task TestEmailNotification(EmailNotification emailNotification, EmailProvider emailProvider)
        {
            MimeMessage email = new();
            email.From.Add(new MailboxAddress("DBGuard", emailProvider.SenderEmail));
            foreach (string toEmail in emailNotification.ToEmails)
            {
                email.To.Add(MailboxAddress.Parse(toEmail));
            }
            foreach (string ccEmail in emailNotification.CCEmails)
            {
                email.Cc.Add(MailboxAddress.Parse(ccEmail));
            }
            foreach (string bcc in emailNotification.BCCEmails)
            {
                email.To.Add(MailboxAddress.Parse(bcc));
            }
            email.Subject = $"[Test] {emailNotification.EmailSubject}";
            string guardStateColor = GuardStateColorMapper.Map(emailNotification.Guard!.GuardState);
            BodyBuilder bodyBuilder = new()
            {
                HtmlBody =
$$"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding: 30px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e; padding: 24px 32px;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; letter-spacing:1px;">DBGuard [Test]</h1>
              <p style="margin:6px 0 0; color:#a0a0c0; font-size:13px;">Automated Alert System</p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background-color:#fff3cd; border-left: 4px solid #e53935; padding: 14px 32px;">
              <p style="margin:0; color:#7a4100; font-size:14px;">
                ⚠️ <strong>This is a notification test</strong> — The Guard status has not changed.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">

              <h2 style="margin: 0 0 16px; color:#1a1a2e; font-size:16px; text-transform:uppercase; letter-spacing:0.5px; border-bottom: 2px solid #e8e8e8; padding-bottom: 8px;">Guard Details</h2>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td width="40%" style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Guard Name</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{emailNotification.Guard!.GuardName ?? "Un-named"}}</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Timestamp</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{DateTimeOffset.UtcNow:yyyy-MM-dd HH:mm:ss}} UTC</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Guard State</td>
                  <td style="padding: 10px 0; vertical-align:top;">
                    <span style="display:inline-block; background-color:{{guardStateColor}}; color:white; font-size:12px; font-weight:bold; padding: 3px 10px; border-radius:12px;">
                      {{emailNotification.Guard.GuardState}}
                    </span>
                  </td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Expression</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top; font-family: monospace;">{{emailNotification.Guard.TriggerColumn}} {{emailNotification.Guard!.TriggerOperator}} {{emailNotification.Guard!.TriggerValue}}</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Database Endpoint</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{emailNotification.Guard.DatabaseConnection!.EndPoint}}</td>
                </tr>

                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Database</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{emailNotification.Guard.DatabaseConnection.DatabaseName}}</td>
                </tr>

                <tr>
                  <td style="padding: 10px 0; color:#666666; font-size:13px; font-weight:bold; vertical-align:top;">Database Engine</td>
                  <td style="padding: 10px 0; color:#1a1a2e; font-size:13px; vertical-align:top;">{{emailNotification.Guard.DatabaseConnection.DatabaseEngine}}</td>
                </tr>

              </table>

              <!-- Query Block -->
              <h2 style="margin: 24px 0 10px; color:#1a1a2e; font-size:16px; text-transform:uppercase; letter-spacing:0.5px; border-bottom: 2px solid #e8e8e8; padding-bottom: 8px;">Trigger Query</h2>
              <div style="background-color:#f8f8f8; border: 1px solid #e0e0e0; border-radius:4px; padding: 12px 16px; font-family: monospace; font-size:13px; color:#333333; word-break:break-all;">
                {{emailNotification.Guard.TriggerQuery}}
              </div>

              <!-- Message Block -->
              <h2 style="margin: 24px 0 10px; color:#1a1a2e; font-size:16px; text-transform:uppercase; letter-spacing:0.5px; border-bottom: 2px solid #e8e8e8; padding-bottom: 8px;">Guard Message</h2>
              <p style="margin:0; color:#444444; font-size:14px; line-height:1.6;">
                {{emailNotification.EmailBody}}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f8f8; padding: 16px 32px; border-top: 1px solid #e8e8e8;">
              <p style="margin:0; color:#999999; font-size:12px; text-align:center;">
                This is an automated message from DBGuard. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
"""
            };
            email.Body = bodyBuilder.ToMessageBody();
            SmtpClient smtp = new();
            string decryptedPassword = _credentialProtector.Decrypt(emailProvider.Password);
            await smtp.ConnectAsync(emailProvider.SMTPServer, emailProvider.Port, false);
            await smtp.AuthenticateAsync(emailProvider.Username, decryptedPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            _logger.LogInformation("An email notification was tested {NotificationId}", emailNotification.Id);
        }
        private async Task TestHttpNotification(HTTPNotification httpNotification, HTTPProvider httpProvider)
        {
     
            using var context = await _dbContextFactory.CreateDbContextAsync();
            Guard? guard = await context.Guards.FindAsync(httpNotification.GuardId);
            if(guard is null)
            {
                throw new ArgumentException("Could not find guard for notification");
            }
            using HttpClient client = _httpClientFactory.CreateClient();
            // Build URL with query parameters
            string url = BuildUrlWithQueryParams(httpNotification.URL, httpNotification.QueryParameters);
            HttpRequestMessage request = new()
            {
                Method = ResolveHttpMethod(httpNotification.HttpMethod),
                RequestUri = new Uri(url)
            };
            // Add headers
            foreach (var header in httpNotification.RequestHeaders)
            {
                if (!request.Headers.TryAddWithoutValidation(header.Key, header.Value ?? string.Empty))
                {
                    // Log error
                    _logger.LogError("Error adding request header for http notification {NotificationId} {GuardId} {HeaderKey}", httpNotification.Id, httpNotification.GuardId, header.Key);
                }
            }
            if (httpNotification.BodyData is not null && httpNotification.BodyType is not null)
            {
                string bodyData = httpNotification.BodyData;
                request.Content = BuildHttpBody(httpNotification.BodyType.Value, bodyData);
            }
            var response = await client.SendAsync(request);

        }
        private async Task SendHttpNotification(HTTPNotification notification, Guard guard, GuardChangeTransaction guardChange)
        {
            var notificationTransactionBuilder = new HTTPNotificationTransaction
            {
                Timestamp = DateTimeOffset.UtcNow,
                GuardId = guard.Id,
                GuardNotificationId = notification.Id,
                NotificationType = NotificationType.HTTP,
                GuardChangeTransactionId = guardChange.Id,
                Successful = false,
                URL = notification.URL,
                HttpMethod = notification.HttpMethod,
                BodyType = notification.BodyType
            };

            try
            {
                using HttpClient client = _httpClientFactory.CreateClient();
                // Build URL with query parameters
                string url = BuildUrlWithQueryParams(notification.URL, notification.QueryParameters);
                HttpRequestMessage request = new()
                {
                    Method = ResolveHttpMethod(notification.HttpMethod),
                    RequestUri = new Uri(url)
                };
                // Add headers
                foreach (var header in notification.RequestHeaders)
                {
                    if (!request.Headers.TryAddWithoutValidation(header.Key, header.Value ?? string.Empty))
                    {
                        // Log error
                        _logger.LogError("Error adding request header for http notification {NotificationId} {GuardId} {HeaderKey}", notification.Id, notification.GuardId, header.Key);
                    }
                }
                if (notification.BodyData is not null && notification.BodyType is not null)
                {
                    string bodyData = ResolveHttpPlaceholders(notification.BodyData, guard, guardChange);
                    request.Content = BuildHttpBody(notification.BodyType.Value, bodyData);
                }
                var response = await client.SendAsync(request);

                // Create transaction
                notificationTransactionBuilder.Successful = response.IsSuccessStatusCode;
                notificationTransactionBuilder.BodyData = request.Content is not null ? await request.Content.ReadAsStringAsync() : null;
                // Request headers
                notificationTransactionBuilder.RequestHeaders = request.Headers
                    .ToDictionary(h => h.Key, h => (string?)string.Join(", ", h.Value));

                // Also capture Content headers (Body headers like Content-Type live here, not request.Headers)
                if (request.Content is not null)
                {
                    foreach (var header in request.Content.Headers)
                        notificationTransactionBuilder.RequestHeaders[header.Key] = string.Join(", ", header.Value);
                }
                notificationTransactionBuilder.QueryParameters = ExtractQueryParametersFromUrl(request.RequestUri);
                notificationTransactionBuilder.ResponseCode = response.StatusCode;
                notificationTransactionBuilder.ResponseMessage = await response.Content.ReadAsStringAsync();

            }
            catch (Exception ex) 
            {
                notificationTransactionBuilder.Successful = false;
                notificationTransactionBuilder.ErrorMessage = ex.Message;
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            await context.NotificationTransactions.AddAsync(notificationTransactionBuilder);
            await context.SaveChangesAsync();
        }
        private static HttpMethod ResolveHttpMethod(HTTPAction method) // Maps my enum to Http method class
        {
            return method switch
            {
                HTTPAction.Get => HttpMethod.Get,
                HTTPAction.Post => HttpMethod.Post,
                HTTPAction.Put => HttpMethod.Put,
                HTTPAction.Patch => HttpMethod.Patch,
                HTTPAction.Delete => HttpMethod.Delete,
                _ => throw new NotSupportedException("Invalid http method used")
            };
        }
        private static string BuildUrlWithQueryParams(string baseUrl, Dictionary<string, string?> queryParams)
        {
            if (queryParams.Count == 0)
            {
                return baseUrl;
            }
            string query = string.Join("&", queryParams.Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value ?? string.Empty)}"));
            string seperator = baseUrl.Contains('?') ? "&" : "?"; // If url contains query params we want to append
            return $"{baseUrl}{seperator}{query}";
        }
        private static string ResolveHttpPlaceholders(string bodyData, Guard guard, GuardChangeTransaction guardChange)
        {
            return bodyData
                .Replace("{{_guardId}}", guardChange.GuardId.ToString())
                .Replace("{{_guardName}}", guard.GuardName ?? string.Empty)
                .Replace("{{_timestamp}}", guardChange.Timestamp.ToString())
                .Replace("{{_currentGuardState}}", guardChange.GuardState.ToString())
                .Replace("{{_previousGuardState}}", guardChange.PreviousGuardState.ToString())
                .Replace("{{_guardQuery}}", guardChange.TriggerQuery)
                .Replace("{{_guardOperator}}", guardChange.TriggerOperator.ToString())
                .Replace("{{_guardValue}}", guardChange.TriggerValue.ToString())
                .Replace("{{_resultValue}}", guardChange.TriggeredValue.ToString())
                .Replace("{{_changeMessage}}", guardChange.Message ?? string.Empty)
                .Replace("{{_databaseEndpoint}}", guardChange.DatabaseConnectionEndPoint)
                .Replace("{{_databaseEngine}}", guardChange.DatabaseConnectionEngine.ToString())
                .Replace("{{_databaseName}}", guardChange.DatabaseName)
                .Replace("{{_databaseUsername}}", guardChange.DatabaseConnectionUsername);
        }
        private static HttpContent BuildHttpBody(HTTPBodyType bodyType, string bodyData)
        {
            return bodyType switch
            {
                HTTPBodyType.Raw => BuildRawHttpBody(bodyData),
                HTTPBodyType.FormURLEncoded => BuildFormEncodedHttpBody(bodyData),
                HTTPBodyType.FormData => BuildFormDataHttpBody(bodyData),
                _ => throw new NotSupportedException($"Type of http body {bodyType} {nameof(bodyType)} is not supported")
            };
        }
        private static HttpContent BuildRawHttpBody(string bodyData)
        {
            var contentType = bodyData.TrimStart().StartsWith('{') || bodyData.TrimStart().StartsWith('[') ? "application/json" : "text/plain";
            return new StringContent(bodyData, Encoding.UTF8, contentType);
        }
        // x-www-form-urlencoded — expects "key=value&key2=value2" or JSON object string
        private static HttpContent BuildFormEncodedHttpBody(string bodyData)
        {
            var pairs = ParseKeyValuePairs(bodyData);
            return new FormUrlEncodedContent(pairs);
        }
        // multipart/form-data — expects "key=value&key2=value2" or JSON object string
        private static HttpContent BuildFormDataHttpBody(string bodyData)
        {
            var form = new MultipartFormDataContent();
            foreach (var (key, value) in ParseKeyValuePairs(bodyData))
                form.Add(new StringContent(value), key);
            return form;
        }
        private static Dictionary<string, string> ParseKeyValuePairs(string bodyData)
        {
            var trimmed = bodyData.Trim();

            // JSON object → parse into key/value pairs
            if (trimmed.StartsWith('{'))
            {
                return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(trimmed)!
                    .ToDictionary(kv => kv.Key, kv => kv.Value.ToString());
            }

            // Query string format: key=value&key2=value2
            return trimmed.Split('&')
                .Select(part => part.Split('=', 2))
                .Where(parts => parts.Length == 2)
                .ToDictionary(
                    parts => Uri.UnescapeDataString(parts[0]),
                    parts => Uri.UnescapeDataString(parts[1])
                );
        }
        private static Dictionary<string, string?> ExtractQueryParametersFromUrl(Uri? uri)
        {
            if (uri is null || string.IsNullOrEmpty(uri.Query))
                return [];

            return uri.Query.TrimStart('?')
                .Split('&', StringSplitOptions.RemoveEmptyEntries)
                .Select(part => part.Split('=', 2))
                .ToDictionary(
                    parts => Uri.UnescapeDataString(parts[0]),
                    parts => parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : null
                );
        }
    }
}
