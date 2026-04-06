using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Helpers
{
    public static class TriggerHelper
    {
        public static bool ColumnExistsInSet(string column, IDictionary<string, object> result)
        {
            if (result is IDictionary<string, object> dict)
            {
                return dict.ContainsKey(column);
            }
            else
            {
                throw new ArgumentException("Result must be of type IDictionary<string, object>");
            }
        }
        public static bool EvaluateTriggerCondition(int actualValue, int triggerValue, GuardOperator guardOperator)
        {
            return guardOperator switch
            {
                GuardOperator.Equals => actualValue == triggerValue,
                GuardOperator.NotEquals => actualValue != triggerValue,
                GuardOperator.GreaterThan => actualValue > triggerValue,
                GuardOperator.LessThan => actualValue < triggerValue,
                GuardOperator.GreaterThanOrEqual => actualValue >= triggerValue,
                    Data.Enums.GuardOperator.LessThanOrEqual => actualValue <= triggerValue,
                _ => throw new NotSupportedException($"Unsupported operator: {guardOperator}")
            };
        }
    }
}
