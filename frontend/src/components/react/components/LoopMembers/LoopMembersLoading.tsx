export default function ChainMemberListLoading() {
  return (
    <main>
      <div className="flex flex-col lg:flex-row max-w-screen-xl mx-auto pt-4 lg:mb-6">
        <section className="lg:w-1/3">
          <div
            className="relative bg-teal-light p-8"
            style={{ height: "420px" }}
          >
            <div className="animate-pulse">
              <div className="bg-teal w-4/5 h-10 mb-8" />
              {[200, 160, 0, 60, 80].map((v, i) => (
                <div className="bg-grey/80 h-6" style={{ width: v }} key={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="lg:w-2/3 relative py-8 sm:p-8 lg:pt-0">
          <div className="px-2 lg:px-0 animate-pulse">
            <div className="bg-secondary mb-6 h-9 w-24" />
            <div className="bg-grey-light h-9 w-full mb-52" />
          </div>
        </section>
      </div>

      <div className="max-w-screen-xl mx-auto px-2 sm:px-8 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 justify-items-center md:justify-items-start">
          <div className="order-1 md:col-span-full lg:col-span-1 bg-secondary mb-6 h-9 w-24" />
          <div className="order-3 sm:order-2 lg:col-span-1 lg:justify-self-center h-12 w-52 bg-teal-light" />
          <div className="order-2 md:justify-self-end lg:order-3 flex flex-col xs:flex-row items-center">
            <div className="bg-accent mb-6 sm:me-4 h-12 w-24" />
            <div className="bg-grey-light mb-6 h-12 w-24" />
          </div>
        </div>

        <div className="bg-grey-light h-9 w-full mb-52" />
      </div>
    </main>
  );
}
