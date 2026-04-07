export type RecordEntry = {
  names: string[];
  year: string;
  mark: string;
};

export type EventRecord = {
  id: string;
  label: string;
  relay: boolean;
  girls: RecordEntry;
  boys: RecordEntry;
};
