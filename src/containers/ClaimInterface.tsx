export function ClaimInterface() {
  return (
    <div className="flex justify-between align-center items-center">
      <div>Your pending rewards: 0</div>
      <div className="w-24 flex justify-center">
        <button
          className="bg-green-500 hover:bg-green-700 font-bold py-1 px-2 rounded"
          disabled
        >
          Claim
        </button>
      </div>
    </div>
  );
}
