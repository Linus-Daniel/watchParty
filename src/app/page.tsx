"use client";
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Buttton';
import { useAuth } from '@/context/AuthContext';

// Animated gradient background component
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-800 to-teal-900 opacity-80"></div>
    <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
    <div className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full bg-purple-600 opacity-20 filter blur-3xl animate-float"></div>
    <div className="absolute top-2/3 left-1/4 w-64 h-64 rounded-full bg-blue-600 opacity-20 filter blur-3xl animate-float-delay"></div>
  </div>
);

// Hero illustration with more playful elements
const HeroIllustration = () => (
  <div className="relative w-full max-w-4xl mx-auto">
    <div className="relative aspect-video bg-gradient-to-br from-indigo-600 to-purple-500 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full h-full bg-black/30 rounded-xl border-2 border-white/10 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              🎉 Your WatchParty Starts Here!
            </div>
          </div>
          <div className="p-4 bg-black/40 border-t border-white/10">
            <div className="flex justify-between items-center">
              <div className="flex -space-x-3">
                {['🐶', '🐱', '🦊', '🐻'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl border-2 border-white/20 hover:scale-110 transition-transform">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center">
                🔴 LIVE • 4 friends watching
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="absolute -z-10 -top-6 -right-6 w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-400 opacity-20 animate-pulse"></div>
    <div className="absolute -z-20 -bottom-6 -left-6 w-full h-full rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-400 opacity-10 animate-pulse-slow"></div>
  </div>
);

// Feature card with more personality
const FeatureCard = ({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full`}>
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-white/80">{description}</p>
  </div>
);

// Testimonial card with better styling
const TestimonialCard = ({ quote, author, role }: { quote: string; author: string; role: string }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full transform hover:scale-[1.02] transition-transform">
    <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
    <p className="text-lg italic mb-6 text-white/90">"{quote}"</p>
    <div className="flex items-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mr-4 flex items-center justify-center text-xl">
        {author.charAt(0)}
      </div>
      <div>
        <div className="font-bold text-white">{author}</div>
        <div className="text-sm text-white/60">{role}</div>
      </div>
    </div>
  </div>
);

const Home: React.FC = () => {
const {user} = useAuth()
  return (
    <>
      <Head>
        <title>WatchParty | Watch Videos Together in Real-Time</title>
        <meta name="description" content="Sync video playback with friends and chat in real-time. Perfect for movie nights, watch parties, and remote teams." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen text-white overflow-hidden">
        <AnimatedBackground />
        <Header />
        
        <main className="relative z-10">
          {/* Hero Section */}
          <section className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold mb-6 border border-white/20 animate-bounce">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                New! Video calls & screen sharing
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-300 to-blue-400 leading-tight">
                Movie nights <br />made magical
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
                Watch videos in perfect sync with friends, family, or coworkers - complete with chat, reactions, and video calls.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user? (
                  <Link href="/room/create" passHref>
                    <Button variant="primary"  className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                      🎬 Create a Room
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signup" passHref>
                      <Button variant="primary"  className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                        🚀 Start for Free
                      </Button>
                    </Link>
                    <Link href="/auth/login" passHref>
                      <Button variant="secondary" className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="mt-20">
              <HeroIllustration />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Party features
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Everything you need for the perfect watch party experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon="🎥"
                title="Perfect Sync"
                description="When one person plays, pauses, or seeks, it updates for everyone instantly."
                color="from-purple-600/90 to-purple-800/90"
              />
              <FeatureCard
                icon="💬"
                title="Group Chat"
                description="Chat with emojis, GIFs, and reactions while watching together."
                color="from-blue-600/90 to-blue-800/90"
              />
              <FeatureCard
                icon="👥"
                title="Video Calls"
                description="See and hear your friends with crystal clear video and audio."
                color="from-cyan-600/90 to-cyan-800/90"
              />
              <FeatureCard
                icon="🔄"
                title="Screen Sharing"
                description="Share your screen for presentations or watching local files together."
                color="from-green-600/90 to-green-800/90"
              />
              <FeatureCard
                icon="🎨"
                title="Custom Rooms"
                description="Personalize your room with themes, colors, and fun effects."
                color="from-yellow-600/90 to-yellow-800/90"
              />
              <FeatureCard
                icon="⚡"
                title="Lightning Fast"
                description="Built for speed with WebSockets and WebRTC for real-time sync."
                color="from-red-600/90 to-red-800/90"
              />
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 bg-white/5 backdrop-blur-sm">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-500">
                  Loved by thousands
                </h2>
                <p className="text-xl text-white/80 max-w-3xl mx-auto">
                  Join our community of happy users enjoying watch parties every day
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <TestimonialCard
                  quote="WatchParty saved our long-distance relationship movie nights. It's like we're cuddled up on the same couch!"
                  author="Jamie & Alex"
                  role="Long-distance couple"
                />
                <TestimonialCard
                  quote="The sync is flawless and the video call integration makes our weekly anime nights so much fun."
                  author="Marcus T."
                  role="Anime Club President"
                />
                <TestimonialCard
                  quote="My remote team uses this for weekly syncs and movie breaks. Way better than any corporate tool!"
                  author="Priya K."
                  role="Tech Team Lead"
                />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to start your WatchParty?</h2>
                <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
                  Join thousands of users enjoying synchronized video experiences with friends and family.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {user ? (
                    <Link href="/room/create" passHref>
                      <Button variant="primary" className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                        🎉 Create a Room
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/signup" passHref>
                        <Button variant="secondary" className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                          Sign Up Free
                        </Button>
                      </Link>
                      <Link href="/auth/login" passHref>
                        <Button variant="primary"  className="w-full sm:w-auto text-white border-white hover:bg-white/10">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Home;