
import React, { useState, useRef } from 'react';
import { UserData, CommunityPost } from '../types';
import { getRank } from '../constants';
import { 
  Trophy, Flame, Swords, Camera, Send, 
  HandMetal, Award, Info, X
} from 'lucide-react';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
}

const CommunityView: React.FC<Props> = ({ data, update }) => {
  const [activeTab, setActiveTab] = useState<'Hub' | 'Leaderboard'>('Hub');
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [showLesson, setShowLesson] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRank = getRank(data.warriorCodePoints);

  // --- POST LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitPost = () => {
    if (!newPostText.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: 'You',
      rank: currentRank.name,
      content: newPostText,
      image: newPostImage || undefined,
      timestamp: new Date().toISOString(),
      reactions: { fire: 0, muscle: 0, trophy: 0, salute: 0 }
    };

    update({ 
      communityPosts: [newPost, ...data.communityPosts],
      warriorCodePoints: data.warriorCodePoints + 15 
    });
    setNewPostText('');
    setNewPostImage(null);
  };

  const handleReaction = (postId: string, type: 'fire' | 'muscle' | 'trophy' | 'salute') => {
    const updatedPosts = data.communityPosts.map(post => {
      if (post.id === postId) {
        if (post.userReacted === type) {
          return {
            ...post,
            reactions: { ...post.reactions, [type]: post.reactions[type] - 1 },
            userReacted: undefined
          };
        }
        if (post.userReacted) {
          const oldType = post.userReacted as keyof typeof post.reactions;
          return {
            ...post,
            reactions: { 
              ...post.reactions, 
              [oldType]: post.reactions[oldType] - 1,
              [type]: post.reactions[type] + 1
            },
            userReacted: type
          };
        }
        return {
          ...post,
          reactions: { ...post.reactions, [type]: post.reactions[type] + 1 },
          userReacted: type
        };
      }
      return post;
    });
    update({ communityPosts: updatedPosts });
  };

  // --- LEADERBOARD LOGIC ---
  const completedGoals = {
    short: data.goals.filter(g => g.category === 'Short-Term' && g.completed).length,
    mid: data.goals.filter(g => g.category === 'Mid-Range' && g.completed).length,
    long: data.goals.filter(g => g.category === 'Big Vision' && g.completed).length,
    total: data.goals.filter(g => g.completed).length
  };

  const baseLeaderboard = [
    { name: 'Cmdr. Jaxon', rank: 'Legend', short: 45, mid: 12, long: 3, points: 5200 },
    { name: 'Vanguard Kael', rank: 'Master', short: 30, mid: 8, long: 1, points: 2100 },
    { name: 'Warrior Sarah', rank: 'Adept', short: 15, mid: 4, long: 0, points: 850 },
  ];
  
  const userEntry = { 
    name: 'You', 
    rank: currentRank.name, 
    short: completedGoals.short, 
    mid: completedGoals.mid, 
    long: completedGoals.long,
    points: data.warriorCodePoints
  };

  const fullLeaderboard = [...baseLeaderboard, userEntry].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-10 md:space-y-12 pb-20">
      
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-white/20 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <div className="mb-6">
                <div className="w-12 h-12 bg-[#f78121]/10 rounded-full flex items-center justify-center border border-[#f78121]/30">
                  <Info size={24} className="text-[#f78121]" />
                </div>
              </div>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-wide text-white mb-4">Iron Sharpens Iron</h3>
              <p className="text-base text-white/70 font-medium leading-relaxed italic">
                "Isolation is the enemy. In the tribe, we find strength, accountability, and the shared standard of excellence. Your tribe determines your trajectory."
              </p>
           </div>
        </div>
      )}

      {/* Main Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Global Community</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Community Hub</p>
      </header>

      {/* RANK & XP DASHBOARD */}
      <section className="glass-card p-6 md:p-8 flex items-center justify-between relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1">
         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Trophy size={140} />
         </div>
         <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-[#f78121]/10 rounded-full border border-[#f78121]/20 shadow-md">
               <Trophy size={32} className="text-[#f78121]" />
            </div>
            <div>
               <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider">{currentRank.name}</h3>
               <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Current Rank</p>
            </div>
         </div>
         <div className="text-right relative z-10">
            <div className="text-3xl md:text-5xl font-black text-white tracking-tighter">{data.warriorCodePoints.toLocaleString()}</div>
            <p className="text-xs font-bold text-[#45d0d0] uppercase tracking-widest">Total XP</p>
         </div>
      </section>

      {/* Tabs */}
      <div className="flex p-1.5 glass-card shadow-inner gap-1 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('Hub')}
          className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-warrior transition-all duration-500 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'Hub' ? 'bg-[#f78121] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
        >
          <Swords size={14} /> Insights Exchange
        </button>
        <button 
          onClick={() => setActiveTab('Leaderboard')}
          className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-warrior transition-all duration-500 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'Leaderboard' ? 'bg-[#f78121] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
        >
          <Trophy size={14} /> Rankings
        </button>
      </div>

      {activeTab === 'Hub' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <section className="glass-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#f78121] mb-4">Report Victory</h3>
            <textarea 
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Share an update..."
              className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] transition-all min-h-[80px] placeholder:text-[#595b61]/70"
            />
            {newPostImage && (
              <div className="mt-4 relative">
                <img src={newPostImage} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-white/20" />
                <button 
                  onClick={() => setNewPostImage(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 text-white/50 hover:text-[#f78121] text-xs font-bold uppercase tracking-widest"
              >
                <Camera size={18} /> <span>Add Photo</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <button 
                onClick={submitPost}
                disabled={!newPostText.trim()}
                className="bg-[#f78121] text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs disabled:opacity-50 hover:bg-orange-600 transition-all flex items-center space-x-2 shadow-lg"
              >
                <span>Broadcast</span> <Send size={14} />
              </button>
            </div>
          </section>

          <div className="space-y-6">
            {data.communityPosts.map(post => (
              <div key={post.id} className="glass-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f78121] to-[#e67e22] flex items-center justify-center text-white font-black text-sm">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wide text-white">{post.author}</h4>
                      <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{post.rank} Class</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 font-bold uppercase">{new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
                
                <p className="text-sm md:text-base text-white/90 leading-relaxed mb-4 font-medium">"{post.content}"</p>
                
                {post.image && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                    <img src={post.image} alt="Post content" className="w-full object-cover max-h-64" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleReaction(post.id, 'fire')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ${post.userReacted === 'fire' ? 'bg-[#f78121]/20 text-[#f78121]' : 'hover:bg-white/10 text-white/50'}`}
                    >
                      <Flame size={18} />
                      <span className="text-xs font-black">{post.reactions.fire}</span>
                    </button>
                    <button 
                      onClick={() => handleReaction(post.id, 'muscle')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ${post.userReacted === 'muscle' ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-white/50'}`}
                    >
                      <HandMetal size={18} />
                      <span className="text-xs font-black">{post.reactions.muscle}</span>
                    </button>
                    <button 
                      onClick={() => handleReaction(post.id, 'trophy')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ${post.userReacted === 'trophy' ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 text-white/50'}`}
                    >
                      <Trophy size={18} />
                      <span className="text-xs font-black">{post.reactions.trophy}</span>
                    </button>
                    <button 
                      onClick={() => handleReaction(post.id, 'salute')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ${post.userReacted === 'salute' ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/10 text-white/50'}`}
                    >
                      <Award size={18} />
                      <span className="text-xs font-black">{post.reactions.salute}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Leaderboard' && (
        <section className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-right-4 transition-all duration-300 ease-in-out hover:-translate-y-1">
          <div className="flex items-center space-x-3 mb-6">
              <Trophy size={24} className="text-[#f78121]" />
              <h3 className="text-sm md:text-base font-black font-brand-header uppercase tracking-[0.2em] text-white">Global Rankings</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left warrior-zebra min-w-[500px]">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-white/50">Rank</th>
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-white/50">Warrior</th>
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-white/50 text-center">Class</th>
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-white/50 text-center">Goals</th>
                  <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-white/50 text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {fullLeaderboard.map((user, idx) => (
                  <tr key={idx} className={`border-b border-white/10 ${user.name === 'You' ? 'bg-[#f78121]/10' : ''}`}>
                      <td className="py-4 px-4 text-sm font-black text-white/40">#{idx + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black text-white">
                              {user.name.charAt(0)}
                            </div>
                            <span className={`text-sm font-bold ${user.name === 'You' ? 'text-[#f78121]' : 'text-white'}`}>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 rounded text-white/60">{user.rank}</span>
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-bold text-white/60">
                        {user.short + user.mid + user.long}
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-black text-white">
                        {user.points.toLocaleString()}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default CommunityView;
