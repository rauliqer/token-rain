export default function PrivacyPolicy() {
  return (
    <div className="tr-bg">
      <div className="tr-wrap">
        <div className="tr-card pad tr-heroCard">
          <h1 className="tr-heroTitle">Privacy Policy</h1>

          <div className="tr-cardDivider" />

          <div className="tr-cardBody">
            <p className="tr-subLine">
              Token Rain does not collect, store, or process personal data.
            </p>

            <p className="tr-subLine">
              The application interacts with the Linea blockchain and reads
              publicly available wallet information, such as wallet addresses
              and on-chain activity.
            </p>

            <p className="tr-subLine">
              No user accounts are created and no personal identifiers such as
              names, emails, or IP addresses are collected by Token Rain.
            </p>

            <p className="tr-subLine">
              Any interaction with smart contracts is performed directly by the
              user through their wallet provider.
            </p>

            <p className="tr-subLine">
              By using Token Rain, you acknowledge that blockchain transactions
              are public and immutable.
            </p>

            <p className="tr-subLine">
              If you have any questions regarding this privacy policy, please
              contact us via our official X account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
