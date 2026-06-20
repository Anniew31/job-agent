"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND } from "../../lib/theme";
import { updateBasicProfile, updateProfessionalProfile, updateEducation, updateExperience, updateProjects, updatePreferences, completeProfile} from "../../lib/api";

const inp = (): React.CSSProperties => ({
    width: "100%", padding: "0.6rem 0.875rem",
    borderRadius: "8px", border: `1px solid ${BRAND.border}`,
    background: BRAND.bg, color: BRAND.navy, fontSize: "0.875rem",
    outline: "none", boxSizing: "border-box",
    fontFamily: "system-ui, sans-serif"
});

const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.775rem",
    fontWeight: 600, color: BRAND.navyMid, marginBottom: "0.35rem"
};

const pill = (active: boolean): React.CSSProperties => ({
    padding: "0.35rem 0.875rem", borderRadius: "100px", cursor: "pointer",
    fontSize: "0.775rem", fontWeight: 500,
    border: `1px solid ${active ? BRAND.blue : BRAND.border}`,
    background: active ? BRAND.blueLight : BRAND.surface,
    color: active ? BRAND.navy : BRAND.muted,
    transition: "all 0.15s"
});

const addBtn: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "6px", border: `1px dashed ${BRAND.border}`,
    background: "none", color: BRAND.muted, cursor: "pointer",
    padding: "0.55rem 0.875rem", borderRadius: "8px",
    fontSize: "0.8rem", fontWeight: 500, width: "100%",
    marginTop: "0.5rem", fontFamily: "system-ui, sans-serif"
};

const removeBtn: React.CSSProperties = {
    border: "none", background: "none", cursor: "pointer",
    color: BRAND.red, fontSize: "0.775rem", fontWeight: 600,
    padding: "0.2rem 0.4rem", borderRadius: "5px", flexShrink: 0
};

const divider: React.CSSProperties = {
    height: 1, background: BRAND.borderLight, margin: "1.25rem 0"
};

const sectionLabel = (color = BRAND.blue): React.CSSProperties => ({
    fontSize: "0.72rem", fontWeight: 700, color,
    textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.75rem"
});


function StepBasic({ data, set }: { data: any; set: (d: any) => void }) {
    const roles = [ "Software Engineer Intern", "Frontend Intern", "Full Stack Intern", "Backend Intern", "ML Intern"];
    const roleTypes = ["Internship", "Fulltime", "Either"];
    const workPrefs = ["Remote", "Onsite", "Hybrid", "Any"];
    const selected: string[] = data.target_roles || [];
    const customRoles = selected.filter(r => !roles.includes(r));
    const allRoles = [...roles, ...customRoles];

    const toggleRole = (r: string) => {
        set({ ...data, target_roles: selected.includes(r) ? selected.filter(x => x !== r) : [...selected, r] });
    };

    return (
    <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <div>
                <p style={lbl}>Full name</p>
                <input style={inp()} placeholder="Jane Doe" value={data.name || ""} onChange={e => set({ ...data, name: e.target.value })} />
            </div>
            <div>
                <p style={lbl}>Phone</p>
                <input style={inp()} placeholder="1234567890" value={data.phone || ""} onChange={e => set({ ...data, phone: e.target.value })} />
            </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
            <p style={lbl}>Location</p>
            <input style={inp()} placeholder="NYC, NY" value={data.location || ""} onChange={e => set({ ...data, location: e.target.value })} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
            <p style={lbl}>Target roles</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
                {allRoles.map(r => (
                    <button key={r} style={pill(selected.includes(r))} onClick={() => toggleRole(r)}>{r}</button>
                ))}
            </div>
            <input style={inp()} placeholder="Type a custom role and press Enter"
                onKeyDown={e => {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (e.key === "Enter" && val) {
                        toggleRole(val);
                        (e.target as HTMLInputElement).value = "";
                    }
            }}
            />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
                <p style={lbl}>Role type</p>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1rem"}}>
                    {roleTypes.map(t => (
                        <button key={t} style={pill(data.role_type === t)} onClick={() => set({ ...data, role_type: t })}>{t}</button>
                    ))}
                </div>
            </div>
            <div>
                <p style={lbl}>Work preference</p>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1rem" }}>
                    {workPrefs.map(t => (
                        <button key={t} style={pill(data.work_preference === t)} onClick={() => set({ ...data, work_preference: t })}>{t}</button>
                    ))}
                </div>
            </div>
        </div>
    </>
    );
}

function StepProfessional({ data, set }: { data: any; set: (d: any) => void }) {
    const websites: any[] = data.websites || [];
    
    const skills = data.skills && Object.keys(data.skills).length > 0 
        ? data.skills 
        : { "Category 1": [] };

    const categories = Object.keys(skills);

    const updateWebsite = (i: number, key: string, val: string) => {
        const updated = [...websites];
        updated[i] = { ...updated[i], [key]: val };
        set({ ...data, websites: updated });
    };

    const handleSkillValueChange = (cat: string, value: string) => {
        const rawSkillsStrings = { ...(data.raw_skills_strings || {}) };
        rawSkillsStrings[cat] = value;
        set({ ...data, raw_skills_strings: rawSkillsStrings });
    };

    const handleSkillValueBlur = (cat: string) => {
        const currentString = (data.raw_skills_strings || {})[cat] || "";
        const cleanArray = currentString.split(",").map((s: string) => s.trim()).filter(Boolean);
        
        const updatedSkills = { ...skills };
        updatedSkills[cat] = cleanArray;
        set({ ...data, skills: updatedSkills });
    };

    const handleCategoryNameChange = (oldName: string, newName: string) => {
        if (!newName.trim() || oldName === newName) return;

        const updatedSkills: any = {};
        const updatedRawStrings: any = {};

        Object.keys(skills).forEach(cat => {
            const currentKey = cat === oldName ? newName : cat;
            updatedSkills[currentKey] = skills[cat];
            if (data.raw_skills_strings?.[cat] !== undefined) {
                updatedRawStrings[currentKey] = data.raw_skills_strings[cat];
            }
        });

        set({ 
            ...data, 
            skills: updatedSkills,
            raw_skills_strings: updatedRawStrings
        });
    };

    const addCategory = () => {
        if (categories.length >= 4) return;
        const nextNum = categories.length + 1;
        set({
            ...data,
            skills: { ...skills, [`Category ${nextNum}`]: [] }
        });
    };

    const removeCategory = (catToDelete: string) => {
        if (categories.length <= 1) return;
        
        const updatedSkills = { ...skills };
        delete updatedSkills[catToDelete];

        const updatedRawStrings = { ...(data.raw_skills_strings || {}) };
        delete updatedRawStrings[catToDelete];

        set({
            ...data,
            skills: updatedSkills,
            raw_skills_strings: updatedRawStrings
        });
    };

    return (
    <>
        <div style={{ marginBottom: "1rem" }}>
            <p style={lbl}>Professional summary</p>
            <p style={{ fontSize: "0.72rem", color: BRAND.muted, margin: "0 0 1rem" }}>2 sentences that is used to write cover letters</p>
            <textarea
                style={{ ...inp(), resize: "vertical", minHeight: 80 }}
                placeholder="I am a professional with hands-on experience..."
                value={data.positioning || ""}
                onChange={e => set({ ...data, positioning: e.target.value })}
            />
        </div>

        <div style={{ marginBottom: "1rem" }}>
            <p style={lbl}>Websites</p>
            {websites.map((w: any, i: number) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem", marginTop: "1rem", alignItems: "center" }}>
                    <input style={inp()} placeholder="Label (e.g. GitHub)" value={w.label || ""} onChange={e => updateWebsite(i, "label", e.target.value)} />
                    <input style={inp()} placeholder="URL" value={w.url || ""} onChange={e => updateWebsite(i, "url", e.target.value)} />
                    <button style={removeBtn} onClick={() => set({ ...data, websites: websites.filter((_: any, j: number) => j !== i) })}>✕</button>
                </div>
            ))}
            <button style={addBtn} onClick={() => set({ ...data, websites: [...websites, { label: "", url: "" }] })}>+ Add website</button>
        </div>

        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <p style={lbl}>Skills by category ({categories.length}/4)</p>
                {categories.length < 4 && (
                    <button onClick={addCategory} style={{ ...addBtn, width: "auto", margin: 0, padding: "0.25rem 0.5rem" }}>+ Add Category</button>
                )}
            </div>
            
            {categories.map((cat) => {
                const displayValue = data.raw_skills_strings?.[cat] !== undefined 
                    ? data.raw_skills_strings[cat] 
                    : (skills[cat] || []).join(", ");

                return (
                    <div key={cat} style={{ 
                        background: BRAND.bg, padding: "1rem", borderRadius: "8px", 
                        border: `1px solid ${BRAND.borderLight}`, marginBottom: "1rem" 
                    }}>
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <input
                                style={{ ...inp(), fontWeight: 600, background: BRAND.surface }}
                                defaultValue={cat}
                                placeholder="Category Name (e.g. Languages)"
                                onBlur={(e) => handleCategoryNameChange(cat, e.target.value)}
                            />
                            {categories.length > 1 && (
                                <button style={removeBtn} onClick={() => removeCategory(cat)}>✕</button>
                            )}
                        </div>
                        <input
                            style={inp()}
                            placeholder="Skill 1, Skill 2, Skill 3"
                            value={displayValue}
                            onChange={e => handleSkillValueChange(cat, e.target.value)}
                            onBlur={() => handleSkillValueBlur(cat)}
                        />
                    </div>
                );
            })}
        </div>
    </>
    );
}

function StepEducation({ data, set }: { data: any; set: (d: any) => void }) {
    const education: any[] = data.education || [{}];

    const update = (i: number, key: string, val: any) => {
    const updated = [...education];
    updated[i] = { ...updated[i], [key]: val };
    set({ ...data, education: updated });
    };

    return (
    <>
        {education.map((edu: any, i: number) => (
            <div key={i}>
                {i > 0 && <div style={divider} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <p style={sectionLabel()}>Education {i + 1}</p>
                    {i > 0 && <button style={removeBtn} onClick={() => set({ ...data, education: education.filter((_: any, j: number) => j !== i) })}>✕ remove</button>}
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                    <p style={lbl}>School</p>
                    <input style={inp()} placeholder="Cornell University" value={edu.school || ""} onChange={e => update(i, "school", e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div>
                        <p style={lbl}>Degree</p>
                        <input style={inp()} placeholder="Bachelor of Science" value={edu.degree || ""} onChange={e => update(i, "degree", e.target.value)} />
                    </div>
                    <div>
                        <p style={lbl}>Major</p>
                        <input style={inp()} placeholder="Computer Science" value={edu.major || ""} onChange={e => update(i, "major", e.target.value)} />
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                    <div>
                        <p style={lbl}>Location</p>
                        <input style={inp()} placeholder="Ithaca, NY" value={edu.location || ""} onChange={e => update(i, "location", e.target.value)} />
                    </div>
                    <div>
                        <p style={lbl}>GPA (optional)</p>
                        <input style={inp()} type="number" step="0.01" placeholder="3.5" value={edu.gpa || ""} onChange={e => update(i, "gpa", parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <p style={lbl}>Grad year</p>
                        <input style={inp()} type="number" placeholder="2029" value={edu.grad_year || ""} onChange={e => update(i, "grad_year", parseInt(e.target.value))} />
                    </div>
                </div>
            </div>
        ))}
        <button style={{ ...addBtn, marginTop: "1.25rem" }} onClick={() => set({ ...data, education: [...education, {}] })}>+ Add another school</button>
    </>
    );
}

function BulletList({ bullets, onUpdate, onAdd, onRemove }: { bullets: string[];
onUpdate: (i: number, val: string) => void;
    onAdd: () => void;
    onRemove: (i: number) => void;
    }) {
        return (
        <>
            {bullets.map((b: string, bi: number) => (
            <div key={bi} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                <span style={{ color: BRAND.faint, paddingTop: "0.6rem", fontSize: "0.8rem", flexShrink: 0 }}>•</span>
                <textarea
                    style={{ ...inp(), resize: "vertical", minHeight: 52, flex: 1 }}
                    placeholder="Describe what you did and the impact..."
                    value={b}
                    onChange={e => onUpdate(bi, e.target.value)}
                />
                <button onClick={() => onRemove(bi)} style={{ ...removeBtn, paddingTop: "0.5rem" }}>✕</button>
            </div>
            ))}
            <button style={addBtn} onClick={onAdd}>+ Add bullet</button>
        </>
        );
    }

function StepExperience({ data, set }: { data: any; set: (d: any) => void }) {
    const experience: any[] = data.experience || [];
    const update = (i: number, key: string, val: any) => {
    const updated = [...experience];
    updated[i] = { ...updated[i], [key]: val };
    set({ ...data, experience: updated });
    };

    const updateBullet = (ei: number, bi: number, val: string) => {
    const updated = [...experience];
    const bullets = [...(updated[ei].bullets || [])];
    bullets[bi] = val;
    updated[ei] = { ...updated[ei], bullets };
    set({ ...data, experience: updated });
    };

    return (
    <>
        {experience.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: BRAND.faint, textAlign: "center", padding: "0.75rem 0" }}>No experience added yet.</p>
        )}
        {experience.map((exp: any, i: number) => (
            <div key={i}>
                {i > 0 && <div style={divider} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <p style={sectionLabel()}>Experience {i + 1}</p>
                    <button style={removeBtn} onClick={() => set({ ...data, experience: experience.filter((_: any, j: number) => j !== i) })}>✕ remove</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div>
                        <p style={lbl}>Company</p>
                        <input style={inp()} placeholder="Google" value={exp.company || ""} onChange={e => update(i, "company", e.target.value)} />
                    </div>
                    <div>
                        <p style={lbl}>Position</p>
                        <input style={inp()} placeholder="Software Engineer" value={exp.position || ""} onChange={e => update(i, "position", e.target.value)} />
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
                    <div>
                        <p style={lbl}>Start date (MM/YYYY)</p>
                        <input style={inp()} placeholder="01/2024" value={exp.start_date || ""} onChange={e => update(i, "start_date", e.target.value)} />
                    </div>
                    <div>
                        <p style={lbl}>End date (blank if current)</p>
                        <input style={inp()} placeholder="02/2026" value={exp.end_date || ""} onChange={e => update(i, "end_date", e.target.value || null)} />
                    </div>
                </div>
                <p style={lbl}>Bullet points</p>
                <BulletList
                    bullets={exp.bullets || []}
                    onUpdate={(bi, val) => updateBullet(i, bi, val)}
                    onAdd={() => update(i, "bullets", [...(exp.bullets || []), ""])}
                    onRemove={bi => update(i, "bullets", (exp.bullets || []).filter((_: any, j: number) => j !== bi))}
                />
            </div>
        ))}
        <button style={{ ...addBtn, marginTop: "1rem" }} onClick={() => set({ ...data, experience: [...experience, { bullets: [""] }] })}>+ Add experience</button>
    </>
    );
}

function StepProjects({ data, set }: { data: any; set: (d: any) => void }) {
    const projects: any[] = data.projects || [];

    const update = (i: number, key: string, val: any) => {
    const updated = [...projects];
    updated[i] = { ...updated[i], [key]: val };
    set({ ...data, projects: updated });
    };

    const updateBullet = (pi: number, bi: number, val: string) => {
    const updated = [...projects];
    const bullets = [...(updated[pi].bullets || [])];
    bullets[bi] = val;
    updated[pi] = { ...updated[pi], bullets };
    set({ ...data, projects: updated });
    };

    return (
    <>
        {projects.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: BRAND.faint, textAlign: "center", padding: "0.75rem 0" }}>No projects added yet.</p>
        )}
        {projects.map((proj: any, i: number) => (
            <div key={i}>
                {i > 0 && <div style={divider} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <p style={sectionLabel()}>Project {i + 1}</p>
                    <button style={removeBtn} onClick={() => set({ ...data, projects: projects.filter((_: any, j: number) => j !== i) })}>✕ remove</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div>
                        <p style={lbl}>Project name</p>
                        <input style={inp()} placeholder="Chatbot" value={proj.name || ""} onChange={e => update(i, "name", e.target.value)} />
                    </div>
                    <div>
                        <p style={lbl}>Date (optional)</p>
                        <input style={inp()} placeholder="Fall 2025" value={proj.date || ""} onChange={e => update(i, "date", e.target.value)} />
                    </div>
                </div>
                <div style={{ marginBottom: "0.875rem" }}>
                    <p style={lbl}>Tech stack (optional)</p>
                    <input style={inp()} placeholder="Python, Pandas" value={proj.tech_stack || ""} onChange={e => update(i, "tech_stack", e.target.value)} />
                </div>
                <p style={lbl}>Bullet points</p>
                <BulletList
                    bullets={proj.bullets || []}
                    onUpdate={(bi, val) => updateBullet(i, bi, val)}
                    onAdd={() => update(i, "bullets", [...(proj.bullets || []), ""])}
                    onRemove={bi => update(i, "bullets", (proj.bullets || []).filter((_: any, j: number) => j !== bi))}
                />
            </div>
        ))}
        <button style={{ ...addBtn, marginTop: "1rem" }} onClick={() => set({ ...data, projects: [...projects, { bullets: [""] }] })}>+ Add project</button>
    </>
    );
}

function StepPreferences({ data, set }: { data: any; set: (d: any) => void }) {
    return (
    <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
                <p style={lbl}>Minimum salary</p>
                <input style={inp()} type="number" placeholder="35" value={data.salary_floor || ""} onChange={e => set({ ...data, salary_floor: parseInt(e.target.value) })} />
            </div>
            <div>
                <p style={lbl}>Salary type</p>
                <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.2rem" }}>
                    {["hourly", "annual"].map(t => (
                        <button key={t} style={pill(data.salary_type === t)} onClick={() => set({ ...data, salary_type: t })}>{t}</button>
                    ))}
                </div>
            </div>
        </div>
        <div>
            <p style={lbl}>Deal-breakers (one per line)</p>
            <p style={{ fontSize: "0.72rem", color: BRAND.muted, margin: "0 0 0.4rem" }}>The AI will auto-reject jobs that violate any of these</p>
            <textarea
                style={{ ...inp(), resize: "vertical", minHeight: 100 }}
                placeholder={"requires more than 1 year experience\nunpaid\nrequires security clearance"}
                value={(data.deal_breakers || []).join("\n")}
                onChange={e => set({ ...data, deal_breakers: e.target.value.split("\n").filter(Boolean) })}
            />
        </div>
    </>
    );
}

const STEPS = ["Basic Info", "Professional", "Education", "Experience", "Projects", "Preferences"];
const STEP_DESCRIPTIONS = [
    "Tell us about yourself so we can find relevant jobs.",
    "Add your skills, links, and professional summary.",
    "Add your schools and degrees.",
    "Add your work experience.",
    "Add your personal and technical projects.",
    "Set your salary and job preferences.",
];

const STEP_SAVERS = [
    (d: any) => updateBasicProfile({ name: d.name, phone: d.phone, location: d.location, target_roles: d.target_roles || [], role_type: d.role_type, work_preference: d.work_preference }),
    (d: any) => updateProfessionalProfile({ positioning: d.positioning, websites: d.websites || [], skills: d.skills || {} }),
    (d: any) => updateEducation({ education: d.education || [] }),
    (d: any) => updateExperience({ experience: d.experience || [] }),
    (d: any) => updateProjects({ projects: d.projects || [] }),
    (d: any) => updatePreferences({ salary_floor: d.salary_floor, salary_type: d.salary_type, deal_breakers: d.deal_breakers || [] }),
];

export default function CreateProfilePage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLast = step === STEPS.length - 1;
    const progress = ((step + 1) / STEPS.length) * 100;

    const stepComponents = [
    <StepBasic key={0} data={data} set={setData} />,
    <StepProfessional key={1} data={data} set={setData} />,
    <StepEducation key={2} data={data} set={setData} />,
    <StepExperience key={3} data={data} set={setData} />,
    <StepProjects key={4} data={data} set={setData} />,
    <StepPreferences key={5} data={data} set={setData} />,
    ];

    async function handleNext() {
        setError(null);
        setLoading(true);
        try {
            await STEP_SAVERS[step](data);
            if (isLast) {
                await completeProfile();
                router.push("/dashboard");
            } else {
                setStep(s => s + 1);
            }
        } catch {
            setError("Failed to save — check your inputs and try again");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{
            minHeight: "100vh", background: BRAND.bg,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "2rem",
        }}>

        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "1.75rem" }}>
            <div style={{
                width: 26, height: 26, borderRadius: 7, background: BRAND.blue,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M2 11L5.5 4L9 8L11 5.5L13 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: BRAND.navy, letterSpacing: "-0.02em" }}>job agent</span>
        </Link>

        <div style={{
            width: "100%", maxWidth: "520px",
            background: BRAND.surface, borderRadius: "14px",
            border: `1px solid ${BRAND.border}`, padding: "2rem",
        }}>

            <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: BRAND.blue, margin: 0, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        Step {step + 1} of {STEPS.length}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: BRAND.faint, margin: 0 }}>{STEPS[step]}</p>
                </div>
                <div style={{ height: 4, background: BRAND.borderLight, borderRadius: "100px", overflow: "hidden" }}>
                    <div style={{
                        height: "100%", background: BRAND.blue, borderRadius: "100px",
                        width: `${progress}%`, transition: "width 0.3s ease",
                    }}/>
                </div>
            </div>

            {/* header */}
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", margin: "0 0 0.3rem" }}>
                {STEPS[step]}
            </h1>
            <p style={{ fontSize: "0.85rem", color: BRAND.muted, margin: "0 0 1.5rem", lineHeight: 1.5 }}>
                {STEP_DESCRIPTIONS[step]}
            </p>

            {/* scrollable content */}
            <div style={{ maxHeight: "48vh", overflowY: "auto", paddingRight: "0.25rem" }}>
                {stepComponents[step]}
            </div>

            {/* error */}
            {error && (
                <div style={{
                background: BRAND.redBg, border: `1px solid #F0CACA`,
                borderRadius: "8px", padding: "0.6rem 0.875rem", marginTop: "1rem",
                }}>
                <p style={{ fontSize: "0.8rem", color: BRAND.red, margin: 0 }}>{error}</p>
                </div>
            )}

            {/* nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.75rem" }}>
                <button
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 0}
                    style={{
                        padding: "0.65rem 1.5rem", borderRadius: "8px",
                        border: `1px solid ${BRAND.border}`, background: BRAND.surface,
                        color: step === 0 ? BRAND.faint : BRAND.navyMid,
                        fontSize: "0.875rem", fontWeight: 500,
                        cursor: step === 0 ? "not-allowed" : "pointer",
                        fontFamily: "system-ui, sans-serif",
                    }}
                > 
                    ← Back 
                </button>
                <button
                    onClick={handleNext}
                    disabled={loading}
                    style={{
                        padding: "0.65rem 1.75rem", borderRadius: "8px",
                        border: "none", background: loading ? BRAND.faint : BRAND.navy,
                        color: BRAND.surface, fontSize: "0.875rem",
                        fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                        fontFamily: "system-ui, sans-serif",
                    }}
                >
                    {loading ? "Saving..." : isLast ? "Create profile →" : "Next →"}
                </button>
            </div>
        </div>

        <p style={{ fontSize: "0.75rem", color: BRAND.faint, marginTop: "1.25rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: BRAND.blue, textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
        </p>

    </main>
    );
}