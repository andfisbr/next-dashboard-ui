//
//
//


const DefaultPage = () => {
        return (
                <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
                        {/* LEFT */}
                        <div className="w-full xl:w-2/3 flex flex-col gap-8">
                                <div className="h-full bg-white p-4 rounded-md">
                                        <h1 className="text-xl font-semibold">Default</h1>
                                </div>
                        </div>

                        {/* RIGHT */}
                        <div className="w-full xl:w-1/3 flex flex-col gap-8">
                                <div className="">
                                </div>
                        </div>
                </div>
        )
}


export default DefaultPage
