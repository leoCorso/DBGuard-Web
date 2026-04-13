using System.Text.Json;
using System.Text.Json.Serialization;
using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.JsonConverters
{
    public class CreateNotificationProviderDTOConverter: JsonConverter<CreateNotificationProviderDTO>
    {
        public override CreateNotificationProviderDTO? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            // Peek at the JSON to read NotificationType without consuming the reader
            using JsonDocument doc = JsonDocument.ParseValue(ref reader);
            JsonElement root = doc.RootElement;

            if (!root.TryGetProperty("providerType", out JsonElement typeProp))
                throw new JsonException("Missing notificationType property");

            NotificationType notificationType = (NotificationType)typeProp.GetInt32();

            string json = root.GetRawText();

            return notificationType switch
            {
                NotificationType.Email => JsonSerializer.Deserialize<CreateEmailNotificationProviderDTO>(json, options),
                _ => throw new NotSupportedException($"NotificationType {notificationType} is not supported")
            };
        }

        public override void Write(Utf8JsonWriter writer, CreateNotificationProviderDTO value, JsonSerializerOptions options)
        {
            JsonSerializer.Serialize(writer, value, value.GetType(), options);
        }
    }
}
