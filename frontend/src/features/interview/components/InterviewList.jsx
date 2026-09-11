import InterviewCard from './InterviewCard';

function InterviewList({
  interviews = [],
  onDelete,
  emptyTitle = 'No interview reports yet',
  emptyMessage = 'Your generated interview reports will appear here.',
}) {
  if (!interviews.length) {
    return (
      <div className="history-empty">
        <h3>
          {emptyTitle}
        </h3>

        <p>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {interviews.map(
        (interview) => (
          <InterviewCard
            key={interview._id}
            interview={interview}
            onDelete={onDelete}
          />
        )
      )}
    </div>
  );
}

export default InterviewList;
