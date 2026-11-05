using Cronos;

namespace DBGuardAPI.Helpers
{
    public readonly record struct CronSchedule
    {
        public string Expression { get; }
        public CronSchedule(string expression)
        {
            if(!CronExpression.TryParse(expression, CronFormat.Standard, out _))
            {
                throw new ArgumentException($"Invalid cron expression: {expression}");
            }
            Expression = expression;
        }
        public override string ToString()
        {
            return Expression;
        }
    }
}
