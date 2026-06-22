namespace PlaceGuide.Server.Configuration
{
    public sealed class AudioPassPaymentOptions
    {
        public const string SectionName = "AudioPassPayment";

        public string BankId { get; set; } = string.Empty;

        public string AccountNumber { get; set; } = string.Empty;

        public string AccountName { get; set; } = string.Empty;

        public int AmountVnd { get; set; } = 49000;

        public string TransferContentPrefix { get; set; } = "VINAAUDIO";
    }
}