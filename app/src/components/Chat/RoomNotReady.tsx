interface Props {
  isChainAdmin: boolean;
  onClickEnable: () => void;
}

// This follows the controller / view component pattern
export default function RoomNotReady(props: Props) {
  return (
    <div className="tw-flex tw-justify-center tw-items-center">
      <h1>Room is not enabled</h1>
      {props.isChainAdmin ? (
        <>
          <p>Allow members to chat with each other</p>
          <button
            type="button"
            className="btn btn-purple"
            onClick={props.onClickEnable}
          >
            Enable
          </button>
        </>
      ) : (
        <p>The Loop host needs to enable chat</p>
      )}
    </div>
  );
}
