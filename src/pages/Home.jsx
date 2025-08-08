import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MacbookScroll } from "../components/ui/macbook-scroll";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { BackgroundGradient } from "../components/ui/background-gradient";
import { Spotlight } from "../components/ui/spotlight";
import { SpotlightNew } from "../components/ui/spotlight-new";
import { CardStack } from "../components/ui/card-stack";
import { ParallaxCard } from "../components/ui/parallax-card";
import { CheckCircle, Users, ChartLine, Clock } from "lucide-react";
import { ScrollIndicator } from "../components/ui/scroll-indicator";
import { WaveDivider } from "../components/ui/wave-divider";
import { FeatureComparison } from "../components/ui/feature-comparison";
import { FloatingNav } from "../components/ui/floating-nav";
import { GlowButton } from "../components/ui/glow-button";
import { StatsCard } from "../components/ui/stats-card";
import { Particles } from "../components/ui/particles";
import { CTASection } from "../components/ui/cta-section";
import { SectionHeader } from "../components/ui/section-header";

const features = [
	{
		title: "Task Organization",
		description:
			"Organize and prioritize your tasks with our intuitive interface",
		icon: "📋",
	},
	{
		title: "Team Collaboration",
		description: "Work together seamlessly with real-time updates and sharing",
		icon: "👥",
	},
	{
		title: "Progress Tracking",
		description: "Monitor project progress with visual charts and analytics",
		icon: "📊",
	},
];

const showcaseFeatures = [
	{
		icon: <CheckCircle className="w-12 h-12 text-violet-500 mb-4" />,
		title: "Smart Task Management",
		description: "Intelligent task organization with priority-based scheduling",
	},
	{
		icon: <Users className="w-12 h-12 text-indigo-500 mb-4" />,
		title: "Team Collaboration",
		description: "Real-time updates and seamless team coordination",
	},
	{
		icon: <ChartLine className="w-12 h-12 text-purple-500 mb-4" />,
		title: "Progress Analytics",
		description: "Detailed insights and performance tracking",
	},
	{
		icon: <Clock className="w-12 h-12 text-pink-500 mb-4" />,
		title: "Time Management",
		description: "Efficient scheduling and deadline tracking",
	},
];

const testimonials = [
	{
		id: 1,
		content:
			"This task management system has transformed how our team collaborates. The interface is intuitive and the features are exactly what we needed.",
		name: "Sarah Johnson",
		designation: "Project Manager",
		image: "https://randomuser.me/api/portraits/women/1.jpg",
	},
	{
		id: 2,
		content:
			"The real-time updates and progress tracking have made it so much easier to keep everyone on the same page. Highly recommended!",
		name: "Mike Chen",
		designation: "Team Lead",
		image: "https://randomuser.me/api/portraits/men/2.jpg",
	},
	{
		id: 3,
		content:
			"We've seen a significant boost in productivity since implementing this system. The visual analytics are particularly helpful.",
		name: "Emily Davis",
		designation: "Operations Director",
		image: "https://randomuser.me/api/portraits/women/3.jpg",
	},
];

const Home = () => {
	const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
	const [isHovered, setIsHovered] = useState(false);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const navigate = useNavigate();

	useEffect(() => {
		localStorage.setItem("theme", theme);
		document.documentElement.className = theme;
	}, [theme]);

	useEffect(() => {
		const handleMouseMove = (e) => {
			setMousePosition({ x: e.clientX, y: e.clientY });
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<div className="overflow-hidden min-h-screen bg-white dark:bg-[#0B0B0F] relative">
			<ScrollIndicator />
			<FloatingNav />
			<ThemeToggle theme={theme} setTheme={setTheme} />

			{/* Multiple Spotlight Effects */}
			<SpotlightNew
				className="-top-40 left-0 md:left-60"
				translateY={-280}
				isDark={theme === "dark"}
			/>
			<SpotlightNew
				className="-top-40 right-0 md:right-60"
				translateY={-200}
				xOffset={-100}
				isDark={theme === "dark"}
			/>
			<Spotlight
				className="top-40 left-0 md:left-60"
				fill={theme === "dark" ? "white" : "purple"}
			/>

			{/* Hero Section */}
			<div id="hero" className="relative z-10 pt-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
					className="text-center mb-12"
				>
					<motion.h1
						className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 mb-6 px-4"
						style={{
							transform: `translate(${
								(mousePosition.x - window.innerWidth / 2) * 0.02
							}px, ${(mousePosition.y - window.innerHeight / 2) * 0.02}px)`,
						}}
					>
						Task Management
						<br />
						Reimagined
					</motion.h1>
					<motion.p
						className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						Transform your workflow with our intuitive task management system.
						Built for modern teams who value efficiency and collaboration.
					</motion.p>

					<motion.div
						className="mt-8 flex flex-wrap justify-center gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<GlowButton onClick={() => navigate("/login")}>
							Get Started For Free
						</GlowButton>
						<GlowButton
							onClick={() => navigate("/about")}
							className="bg-transparent dark:bg-transparent"
						>
							Learn More
						</GlowButton>
					</motion.div>
				</motion.div>

				<MacbookScroll
					src="https://media.licdn.com/dms/image/v2/D4D12AQEtGYQYQ93XPA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1679503047532?e=2147483647&v=beta&t=9bLZh99hpSVF2qwZF89Fdp9yaY-hS71m0SJjUzfKfII"
					showGradient={true}
				/>
			</div>

			<WaveDivider className="text-gray-50 dark:text-gray-900" />

			{/* Stats Section */}
			<div className="bg-gray-50 dark:bg-gray-900 relative">
					<Particles
						className="absolute inset-0 pointer-events-none"
						quantity={30}
						stationary={true}
					/>
					
					<SpotlightNew
						className="left-1/2 transform -translate-x-1/2"
						translateY={-150}
						width={800}
						height={800}
						isDark={theme === 'dark'}
					/>

					<div className="max-w-6xl mx-auto px-4 py-20">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<StatsCard 
								value={10000}
								label="Active Users"
								delay={0.2}
							/>
							<StatsCard 
								value={50000}
								label="Tasks Completed"
								delay={0.4}
							/>
							<StatsCard 
								value={99}
								label="Satisfaction Rate"
								delay={0.6}
							/>
						</div>
					</div>
				</div>

			<WaveDivider className="text-white dark:text-[#0B0B0F]" inverted />

			{/* Interactive Features Showcase */}
			<div id="features" className="max-w-7xl mx-auto px-4 py-20">
				<SectionHeader
					title="Powerful Features for Modern Teams"
					description="Experience the next generation of task management with our innovative features"
					className="mb-16"
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
					{showcaseFeatures.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<ParallaxCard>
								{feature.icon}
								<h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
									{feature.title}
								</h3>
								<p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
									{feature.description}
								</p>
							</ParallaxCard>
						</motion.div>
					))}
				</div>
			</div>

			<WaveDivider className="text-gray-50 dark:text-gray-900" />

			{/* Features Section with Comparison */}
			<div id="pricing" className="bg-gray-50 dark:bg-gray-900 py-20">
				<div className="max-w-7xl mx-auto px-4">
					<SectionHeader
						title="Choose Your Plan"
						description="Compare our features and choose the plan that's right for your team"
						className="mb-16"
					/>

					<FeatureComparison />

					<motion.div
						className="mt-12 flex justify-center gap-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Link
							to="/register"
							className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/40 transition-all duration-300"
						>
							Get Started Free
						</Link>
						<Link
							to="/pricing"
							className="px-8 py-4 rounded-full bg-white/10 text-gray-900 dark:text-white font-medium backdrop-blur-sm hover:bg-white/20 border border-gray-200 dark:border-gray-800 transition-all duration-300"
						>
							View Full Pricing
						</Link>
					</motion.div>
				</div>
			</div>

			

		</div>
	);
};

export default Home;
