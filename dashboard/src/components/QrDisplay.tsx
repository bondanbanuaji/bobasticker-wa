
interface QrDisplayProps {
  qr: string | null;
}

export function QrDisplay({ qr }: QrDisplayProps) {
  return (
    <div className="bg-white p-4 rounded-2xl inline-flex items-center justify-center min-h-[250px] min-w-[250px] relative shadow-xl">
      {!qr ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Generating QR Code...</p>
        </div>
      ) : (
        <img 
          src={qr} 
          alt="WhatsApp QR Code" 
          className="w-[218px] h-[218px] rounded-lg animate-in fade-in zoom-in duration-300"
        />
      )}
    </div>
  );
}
