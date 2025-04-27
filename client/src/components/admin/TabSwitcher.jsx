const TabSwitcher = ({ activeTab, setActiveTab }) => (
    <div className="flex gap-2 mb-4">
      {['Songs', 'Albums'].map(tab => (
        <button
          key={tab}
          className={`cursor-pointer hover:bg-gray-500 px-4 py-2 rounded-md ${activeTab === tab ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
  export default TabSwitcher;
  