const EmptyState = ({ title, subtext }: { title: string; subtext: string }) => {
  return (
    <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center">
      <h3 className="h3-bold">{title}</h3>
      <p className="p-regular-20">{subtext}</p>
    </div>
  );
};

export default EmptyState;
