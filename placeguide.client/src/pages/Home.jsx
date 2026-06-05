function Home() {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
            <h1 className="text-3xl font-bold text-red-700">
                Chào mừng đến với VinaFood
            </h1>

            {user && (
                <p className="mt-4 text-lg text-gray-700">
                    Xin chào, {user.fullName}
                </p>
            )}
        </div>
    );
}

export default Home;