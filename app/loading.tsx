import LoadingBrackets from '@/components/ui/loading-brackets';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <LoadingBrackets />
    </div>
  );
}