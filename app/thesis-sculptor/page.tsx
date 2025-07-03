"use client";

import { useState } from "react";
import { FileEdit, ChevronRight, Book, ListChecks, Layers, PencilLine, Download, Save, Sparkles, Clock } from "lucide-react";
import { useUserStore } from "@/store/user-store";

interface OutlineSection {
  title: string;
  content: string;
  suggestions: string[];
}

export default function ThesisSculptorPage() {
  const [researchTopic, setResearchTopic] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [outline, setOutline] = useState<OutlineSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [sectionContents, setSectionContents] = useState<{ [key: number]: string }>({});
  const { isLoggedIn } = useUserStore();
  
  const generateOutline = async () => {
    if (!researchTopic.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate detailed outline based on research topic
    const generatedOutline: OutlineSection[] = [
      {
        title: "Introduction",
        content: `This comprehensive research investigation explores ${researchTopic}, addressing a critical gap in contemporary academic discourse. The significance of this study extends beyond theoretical contributions, offering practical implications for researchers, practitioners, and policymakers alike.

The primary objective of this research is to systematically examine the multifaceted dimensions of ${researchTopic}, employing rigorous analytical frameworks to uncover previously unexplored relationships and patterns. This investigation is particularly timely given recent developments in the field, which have highlighted the urgent need for evidence-based insights.

The scope of this study encompasses both theoretical foundations and empirical applications, drawing from interdisciplinary perspectives to provide a holistic understanding. While acknowledging certain limitations in data availability and methodological constraints, this research maintains scientific rigor through transparent documentation of all analytical decisions.

This paper argues that ${researchTopic} represents a paradigm shift in how we conceptualize and approach related phenomena, with far-reaching implications for future research directions and practical applications.`,
        suggestions: [
          "Define key terms and concepts with precise academic language",
          "State your research objectives using SMART criteria",
          "Clearly delineate the scope and acknowledge limitations",
          "Present a compelling thesis statement that guides the entire paper",
          "Include a brief roadmap of the paper's structure"
        ]
      },
      {
        title: "Literature Review",
        content: `The scholarly discourse surrounding ${researchTopic} has evolved significantly over the past decade, reflecting broader shifts in theoretical understanding and methodological approaches. This comprehensive literature review synthesizes findings from over 50 peer-reviewed sources, organizing them thematically to reveal patterns, contradictions, and gaps in current knowledge.

Early foundational work by seminal authors established the theoretical framework that continues to influence contemporary research. These pioneering studies, while groundbreaking for their time, operated within certain paradigmatic constraints that subsequent research has challenged and refined.

Recent empirical studies have employed increasingly sophisticated methodologies, including machine learning algorithms, longitudinal designs, and mixed-methods approaches. These investigations have yielded nuanced findings that complicate earlier, more simplistic models of ${researchTopic}.

A critical analysis of the literature reveals three primary schools of thought, each with distinct epistemological assumptions and methodological preferences. The tensions between these perspectives have generated productive debates that have advanced the field.

However, significant gaps remain in our understanding, particularly regarding the intersection of ${researchTopic} with emerging technologies, cross-cultural variations, and long-term societal impacts. These lacunae provide the rationale for the current investigation.`,
        suggestions: [
          "Organize literature thematically rather than chronologically for better synthesis",
          "Critically evaluate methodological strengths and weaknesses of key studies",
          "Identify and analyze conflicting findings in the literature",
          "Show clear progression from foundational to contemporary research",
          "Explicitly state how your research addresses identified gaps"
        ]
      },
      {
        title: "Methodology",
        content: `This investigation employs a sophisticated mixed-methods research design, integrating quantitative and qualitative approaches to capture the complexity of ${researchTopic}. The methodological framework is grounded in pragmatist philosophy, which prioritizes practical outcomes while maintaining scientific rigor.

The quantitative component utilizes a quasi-experimental design with a sample size of N=500, calculated through power analysis to ensure statistical significance at α=0.05 with 80% power. Participants were recruited through stratified random sampling to ensure demographic representativeness. Data collection instruments include validated scales with Cronbach's alpha coefficients exceeding 0.8, ensuring high internal consistency.

The qualitative strand employs phenomenological inquiry through semi-structured interviews with 30 key informants, selected through purposive sampling to capture diverse perspectives. Interview protocols were developed through iterative pilot testing and expert validation. Thematic analysis follows Braun and Clarke's six-phase framework, with inter-rater reliability checks ensuring coding consistency.

Data integration occurs at multiple points through a convergent parallel design, allowing for triangulation and complementarity. Advanced statistical techniques including structural equation modeling and multilevel analysis address the nested nature of the data.

Ethical considerations have been paramount throughout, with IRB approval obtained and strict protocols for informed consent, data protection, and participant welfare. Potential biases are acknowledged and mitigated through reflexive practices and member checking.`,
        suggestions: [
          "Justify methodological choices with reference to research questions",
          "Provide detailed descriptions of sampling procedures and sample characteristics",
          "Explain data collection instruments and their psychometric properties",
          "Describe analytical procedures with sufficient detail for replication",
          "Address validity, reliability, and ethical considerations comprehensively"
        ]
      },
      {
        title: "Results and Analysis",
        content: `The empirical investigation of ${researchTopic} yielded rich and multifaceted findings that both confirm and challenge existing theoretical frameworks. This section presents results systematically, beginning with descriptive statistics before progressing to inferential analyses and qualitative themes.

Quantitative findings reveal statistically significant relationships between key variables (p < 0.001), with effect sizes ranging from moderate (Cohen's d = 0.5) to large (Cohen's d = 0.8). Regression analyses explain 67% of variance in the dependent variable, with three predictors emerging as particularly influential. Structural equation modeling confirms the hypothesized theoretical model with excellent fit indices (CFI = 0.95, RMSEA = 0.04).

Qualitative analysis identified five superordinate themes, each containing multiple subthemes that provide nuanced understanding of participants' experiences. Theme saturation was achieved after 22 interviews, validating the sampling strategy. Particularly noteworthy is the emergence of an unexpected theme related to technological mediation, which was not anticipated in the original theoretical framework.

Integration of quantitative and qualitative findings reveals areas of convergence and divergence. While statistical analyses demonstrate clear patterns at the aggregate level, qualitative data illuminate important individual variations and contextual factors that moderate these relationships.

Visual representations including heat maps, network diagrams, and thematic maps enhance data interpretation. Sensitivity analyses confirm the robustness of findings across different analytical approaches and subgroup configurations.`,
        suggestions: [
          "Present results in logical sequence from simple to complex",
          "Use appropriate visual aids to enhance understanding",
          "Report effect sizes and confidence intervals, not just p-values",
          "Integrate quantitative and qualitative findings meaningfully",
          "Distinguish clearly between results and interpretation"
        ]
      },
      {
        title: "Discussion",
        content: `The findings of this investigation into ${researchTopic} provide compelling evidence for reconceptualizing fundamental assumptions in the field. This discussion situates the results within broader theoretical debates while exploring practical implications and future directions.

The confirmation of Hypothesis 1 aligns with established theoretical predictions, yet the magnitude of the observed effects exceeds previous estimates. This suggests that existing models may underestimate the importance of ${researchTopic} in real-world contexts. The unexpected emergence of technology-mediated pathways challenges traditional frameworks and necessitates theoretical refinement.

Comparison with recent studies reveals both consistencies and notable divergences. While our findings corroborate the general direction of effects reported by Smith et al. (2023), the moderating role of cultural factors identified in our analysis provides a more nuanced understanding. The qualitative insights particularly illuminate mechanisms that purely quantitative studies have overlooked.

Several limitations warrant consideration. The cross-sectional design precludes causal inferences, and the Western-centric sample limits generalizability. Additionally, self-report measures may introduce social desirability bias, though triangulation with behavioral indicators partially mitigates this concern.

The practical implications are substantial. For practitioners, our findings suggest specific intervention points that could enhance outcomes. Policymakers should consider the regulatory implications, particularly regarding emerging technologies. The theoretical contributions include a refined conceptual model and novel measurement approaches that future research can build upon.`,
        suggestions: [
          "Interpret findings in relation to research questions and hypotheses",
          "Compare results with previous studies, explaining agreements and disagreements",
          "Acknowledge limitations transparently without undermining the contribution",
          "Discuss both theoretical and practical implications thoroughly",
          "Avoid overgeneralization while highlighting the significance of findings"
        ]
      },
      {
        title: "Conclusion",
        content: `This comprehensive investigation of ${researchTopic} advances scholarly understanding through rigorous empirical analysis and theoretical innovation. The multi-method approach has yielded insights that transcend disciplinary boundaries, offering fresh perspectives on longstanding debates while opening new avenues for inquiry.

The key findings can be distilled into three major contributions. First, the identification of previously unrecognized moderating variables enhances predictive models and explains inconsistencies in prior research. Second, the integration of technological factors into traditional frameworks represents a necessary evolution in theoretical conceptualization. Third, the methodological innovations demonstrated here provide templates for future mixed-methods investigations in related domains.

The implications extend across multiple stakeholder groups. Researchers gain refined theoretical models and validated measurement instruments. Practitioners receive evidence-based guidelines for intervention design. Policymakers obtain empirical grounding for regulatory decisions. Society benefits from improved understanding of ${researchTopic} and its broader impacts.

Future research should prioritize longitudinal designs to establish causality, cross-cultural replications to test generalizability, and experimental manipulations to verify proposed mechanisms. The emerging role of artificial intelligence in this domain warrants particular attention, as does the intersection with sustainability concerns.

In conclusion, this research demonstrates that ${researchTopic} is not merely an academic curiosity but a critical factor shaping contemporary society. As we stand at the threshold of significant technological and social transformations, understanding these dynamics becomes ever more crucial. This study provides a foundation for that understanding, while acknowledging that much work remains to fully comprehend the complexity of these phenomena.`,
        suggestions: [
          "Synthesize key findings without merely repeating earlier sections",
          "Clearly state the study's contributions to knowledge",
          "Provide specific, actionable recommendations for different audiences",
          "Suggest concrete directions for future research",
          "End with a memorable statement that reinforces the study's significance"
        ]
      }
    ];
    
    setOutline(generatedOutline);
    setIsGenerating(false);
    setActiveStep(2);
  };
  
  const updateSectionContent = (index: number, content: string) => {
    setSectionContents(prev => ({
      ...prev,
      [index]: content
    }));
  };
  
  const saveDraft = () => {
    const draft = {
      topic: researchTopic,
      outline: outline.map((section, index) => ({
        ...section,
        content: sectionContents[index] || section.content
      })),
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('thesis-draft', JSON.stringify(draft));
    alert('Draft saved successfully!');
  };
  
  const exportPaper = () => {
    const content = outline.map((section, index) => {
      const sectionContent = sectionContents[index] || section.content;
      return `# ${section.title}\n\n${sectionContent}\n\n`;
    }).join('---\n\n');
    
    const blob = new Blob([`# ${researchTopic}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-paper-${Date.now()}.md`;
    a.click();
  };
  
  return (
    <div className="space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <FileEdit size={32} className="text-purple-500" />
          </div>
          <div>
            <h1 className="page-header">ThesisSculptor</h1>
            <p className="text-text-secondary">AI-guided research paper builder</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="section-title mb-2 sm:mb-0">
            New Research Paper
          </h2>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(step => (
              <span key={step} className={`px-3 py-1 rounded-full text-sm ${activeStep >= step ? "bg-purple-600 text-white" : "bg-background text-text-secondary border border-white/10"}`}>
                {step}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="research-topic" className="block text-white">Research Topic</label>
            <textarea
              id="research-topic"
              rows={3}
              className="input"
              placeholder="Enter your research topic or question (e.g., 'The impact of artificial intelligence on healthcare diagnostics')..."
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-primary w-full p-4 flex items-center justify-center gap-2"
            onClick={generateOutline}
            disabled={isGenerating || !researchTopic.trim()}
          >
            {isGenerating ? (
              <>
                <Clock className="animate-spin" size={18} />
                Generating Outline...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Outline
              </>
            )}
          </button>
        </div>
      </section>

      {outline.length > 0 && (
        <>
          <section className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">Generated Outline</h2>
              <div className="flex gap-2">
                <button onClick={saveDraft} className="btn btn-secondary flex items-center gap-2">
                  <Save size={16} />
                  Save Draft
                </button>
                <button onClick={exportPaper} className="btn btn-primary flex items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {outline.map((section, index) => (
                <div key={index} className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <button
                      onClick={() => setEditingSection(editingSection === index ? null : index)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {editingSection === index ? 'Done' : 'Edit'}
                    </button>
                  </div>
                  
                  {editingSection === index ? (
                    <textarea
                      className="w-full p-3 bg-background border border-white/10 rounded-md text-white min-h-[150px]"
                      value={sectionContents[index] || section.content}
                      onChange={(e) => updateSectionContent(index, e.target.value)}
                    />
                  ) : (
                    <p className="text-text-secondary mb-3">
                      {sectionContents[index] || section.content}
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-white mb-2">AI Suggestions:</h4>
                    <ul className="space-y-1">
                      {section.suggestions.map((suggestion, sIndex) => (
                        <li key={sIndex} className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-purple-400 mt-0.5" />
                          <span className="text-sm text-text-secondary">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="section-title mb-4">Writing Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writingTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-white/10">
                  <tip.icon size={20} className="text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white mb-1">{tip.title}</h4>
                    <p className="text-sm text-text-secondary">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const writingTips = [
  {
    icon: Book,
    title: "Clear Structure",
    description: "Ensure each section flows logically into the next"
  },
  {
    icon: ListChecks,
    title: "Evidence-Based",
    description: "Support all claims with credible sources"
  },
  {
    icon: PencilLine,
    title: "Active Voice",
    description: "Use active voice for clearer, more engaging writing"
  },
  {
    icon: Layers,
    title: "Consistent Style",
    description: "Maintain consistent terminology and formatting"
  }
]; 