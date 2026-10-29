'use strict';
const $ = (q, scope = document) => scope.querySelector(q);
const $$ = (q, scope = document) => [...scope.querySelectorAll(q)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-driven text, entrance reveals, and section navigation.
const wordHeading = $('[data-scroll-words]');
wordHeading.innerHTML = [...wordHeading.textContent].map(c => `<span>${c}</span>`).join('');
const words = $$('span', wordHeading);
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, {threshold: .08});
$$('.reveal').forEach(el => observer.observe(el));
let ticking = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('.scroll-progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
  $('.site-header').classList.toggle('scrolled', scrollY > 50);
  const rect = wordHeading.getBoundingClientRect();
  const progress = reducedMotion ? 1 : Math.max(0, Math.min(1, (innerHeight * .85 - rect.top) / (innerHeight * .5)));
  words.forEach((word, i) => word.classList.toggle('lit', i / words.length < progress));
  let current = '';
  ['intro', 'work', 'skills', 'experience'].forEach(id => {
    if (document.getElementById(id).getBoundingClientRect().top <= innerHeight * .35) current = id;
  });
  $$('.desktop-nav a').forEach(a => a.classList.toggle('active', a.hash === '#' + current));
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, {passive:true});
addEventListener('resize', updateScroll);
updateScroll();

// Full-screen navigation with native dialog keyboard behavior.
const menu = $('#site-menu');
const caseDialog = $('#case-dialog');
function syncLock() { document.body.classList.toggle('locked', menu.open || caseDialog.open); }
$('.menu-button').addEventListener('click', () => {
  menu.showModal(); $('.menu-button').setAttribute('aria-expanded', 'true'); syncLock();
});
$('.menu-close').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => { $('.menu-button').setAttribute('aria-expanded', 'false'); syncLock(); });
$$('nav a', menu).forEach(link => link.addEventListener('click', () => menu.close()));

// Project filtering.
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  const category = button.dataset.filter;
  let count = 0;
  $$('.project').forEach(project => {
    const visible = category === 'all' || project.dataset.category === category;
    project.hidden = !visible;
    if (visible) { count++; project.classList.add('visible'); }
  });
  $('.project-grid').classList.toggle('filtered', category !== 'all');
  $('.project-count').textContent = `${count} ${count === 1 ? 'PROJECT' : 'PROJECTS'}`;
}));

// Detailed case studies. Team deliverables are distinct from personal responsibilities.
const cases = {
  agent: {
    label: 'AI AGENT OPERATIONS / 01', title: '把运营经验，写进数字员工。',
    intro: '凯森阳光是一项保险外呼业务。我的工作围绕 AI 数字员工的运营侧落地展开：把业务经验、监控条件和归因口径转化为可以被流程执行的规则。',
    period:'2026.08 — 至今', role:'AI Agent 运营 · 场景定义与规则设计', tools:'OpenClaw / LLM / 业务知识库',
    metrics:[['4','本人负责的核心 Skill'],['23','团队沉淀的可复用技能'],['44','团队沉淀的自动化流程']],
    sections:[
      ['业务背景','<p>项目覆盖 9 个职场，运营涉及多源外呼数据、坐席产能与订单归属。重复性的监控、推送和归因需要清晰的规则，才能支持一致的执行与统计。</p>'],
      ['我的贡献','<ol><li><strong>毛利归因问诊：</strong>将各维度对毛利变动的量化贡献输入 LLM，结合业务知识库，支持自动生成归因分析、趋势判断与优化建议。</li><li><strong>低出单坐席监控：</strong>设计每日识别逻辑，筛出连续 3 日出单不足 12 单的坐席并推送，支持 BPO 团队执行后续管理。</li><li><strong>整点经营推送：</strong>负责每日 5 个时段核心指标的汇总与推送，支持经营监控。</li><li><strong>跨职场归因规则：</strong>把坐席与订单职场不一致时的处理逻辑固化为 Skill，统一统计口径。</li></ol>'],
      ['协作与接入','<p>参与 4 套异构外呼数据源的语义本体归一与配置化接入，对接归因引擎与调度运行时。参与推动商务、建模、运营围绕取数和效果反馈对齐口径。</p>'],
      ['项目成果','<p>原需约 30 分钟人工交叉分析的多维归因，转为自然语言问诊的交互方式。团队最终沉淀 23 个可复用技能与 44 条自动化流程；其中 4 个核心 Skill 的场景与规则由我负责。</p><p>围绕业务逻辑与运营落地，我负责核心场景的定义与规则设计，并与团队协作推进接入、调度和反馈。</p>'],
      ['我的思考','<p>运营型 Agent 的价值，依赖清晰的输入口径、可解释的规则与明确的后续动作。把经验写成规则，也意味着把例外场景和人工复核边界一起写清楚。</p>']
    ]
  },
  voice: {
    label:'CONVERSATIONAL AI / 02', title:'先让指标可信，再让策略有效。',
    intro:'人合车商用车租售项目面向司机及潜在租购客户开展 AI 外呼获客。我负责机器人从零建设中的效果评测与策略迭代，通过异常统计和通话巡检，把“效果不好”拆成可定位、可修正的问题。',
    period:'2026.07 — 2026.10', role:'效果评测 / 话术与标签迭代', tools:'Bad case / AB 对比 / SQL + Python',
    metrics:[['60→72%','意向标签准确率 · +12pp'],['−15%','获客成本 · 多轮迭代结果'],['−80%','数据处理耗时 · ETL 自动化']],
    sections:[
      ['问题定义','<p>统计历史对话中的 ASR 错误、意向标签误判及转人工高发场景。围绕话术主流程、任务意图与对话标签输出建议，建立 Bad case 分析与 Prompt 优化闭环。</p>'],
      ['关键转折','<p>两版开场白各 10 万条话单的对比中，目标意向率分别为 <strong>6.96% 与 0.68%</strong>。差异本身不足以证明话术优劣：通话巡检进一步发现版本 B 的标签误判问题，因此先修正评估口径，再判断策略效果。</p>'],
      ['我的行动','<ol><li><strong>定位误差：</strong>从异常对话切入，区分 ASR、意图理解与标签判定问题，输出话术、任务意图和标签优化建议。</li><li><strong>验证效果：</strong>主导两版开场白的对比实验，通过通话巡检复核异常指标。</li><li><strong>自动化处理：</strong>将手动 SQL、Python 与 Excel 流程改造为 ETL 流水线，并跨商务、建模、算法和线路部门协同迭代。</li></ol>'],
      ['迭代结果','<p>持续迭代后，意向标签准确率从 60% 提升至 72%；项目意向率稳定在约 4%，获客成本降低 15%；自动化流水线降低约 80% 的数据处理耗时。</p><p>结果对应多轮评测、口径修正与策略优化后的整体表现。不同环节的改进共同作用，构成持续运营的反馈闭环。</p>'],
      ['我的思考','<p>AI 评测不只是看一个转化数字。只有标签定义、取数与抽检可靠，后续的策略比较才有意义。异常数据首先是值得调查的信号。</p>']
    ]
  },
  product: {
    label:'AUSSIE ECOLENS / 03', title:'从野生动物媒体，到可检索的物种数据。',
    intro:'Aussie EcoLens 是一个基于 AWS 与 Oracle Cloud Infrastructure（OCI）的多云 Serverless 野生动物媒体管理平台。团队将媒体上传、自动物种识别、标签存储与检索、内容维护及订阅通知串联为完整应用；我主要负责用户认证、API 鉴权、AWS 基础设施部署与系统联调。',
    period:'2026.05 — 2026.06', role:'认证与 AWS 基础设施负责人', tools:'Python / AWS SAM / Cognito / API Gateway / Lambda / S3 / DynamoDB / OCI',
    metrics:[['AWS / OCI','主云处理与跨云通知、审计'],['2','动物检测 → 物种分类'],['4','物种 / 数量 / 缩略图 / 以图查询']],
    sections:[
      ['项目背景','<p>野生动物观察会产生大量图片与视频，人工识别耗时，重复文件占用存储，物种信息也难以直接检索。项目通过事件驱动的数据处理，将非结构化媒体转化为有统一标签结构、可持续查询和维护的数据资产。</p>'],
      ['我的职责','<ol><li><strong>用户认证与接口鉴权：</strong>配置 Cognito User Pool、邮箱验证与密码策略，结合 Amplify SDK 处理前端登录及登录挑战；接入 API Gateway Cognito Authoriser，落实 JWT 校验与未登录访问跳转。</li><li><strong>AWS 部署与上传链路：</strong>负责 AWS SAM 部署、S3 预签名 URL 处理及 S3 事件路由，修复 API Gateway 二进制媒体类型配置，并完成 SPA 前端托管。</li><li><strong>权限设计与系统联调：</strong>在 AWS Academy 的共享 LabRole 约束下完成部署，整理按函数划分的最小权限设计矩阵；完成 Login → Upload → Processing → Search 端到端验证，核对前端查询结果与云端存储的一致性。</li></ol>'],
      ['多云架构','<p><strong>AWS 主云：</strong>React/Vite Web UI 通过 Cognito 完成身份认证，将 JWT 附加至 RESTful API 请求。API Gateway 鉴权后调用 Lambda；S3 存储原文件、缩略图、视频帧与模型，DynamoDB 管理文件元数据、标签索引、订阅记录及去重索引。</p><p><strong>OCI 辅云：</strong>承接带有 Cognito Token 的跨云通知请求，由 OCI Function 通过 JWKS 验证身份，写入 OCI NoSQL 与 Object Storage 审计记录，并尝试保存原文件冷副本。基础设施分别通过 AWS SAM 与 OCI Terraform 定义。</p>'],
      ['自动化处理','<ol><li><strong>校验与上传：</strong>上传前计算 SHA-256 checksum，重复文件直接返回已有记录；新文件通过预签名 URL 直传 S3。</li><li><strong>事件触发识别：</strong>S3 ObjectCreated 事件自动触发处理函数。图片生成保留比例的压缩缩略图，视频按每秒 1 帧抽取，并通过 EventBridge 分发逐帧处理任务。</li><li><strong>标签结构化：</strong>使用提供的 MegaDetector v5a 检测动物，再由微调后的 SpeciesNet 分类物种。将文件类型、物种标签、出现次数及原文件与缩略图信息写入 DynamoDB，并建立 TagIndex。</li></ol><p>模型版本指针存放在 DynamoDB。团队通过上传新模型并更新指针切换版本，将模型更新与应用代码部署分离。</p>'],
      ['查询与内容维护','<p><strong>四种查询路径：</strong>按物种名称进行 AND 条件匹配；按每个物种的 minimum count 筛选；由缩略图 URL 定位原文件；上传图片进行临时识别并查找标签匹配的媒体。TagIndex 通过物种记录的集合交集支持多条件检索。</p><p>用户可通过 RESTful API 与 Web UI 查询、批量增删标签及删除文件。标签修改同步更新文件记录与索引；删除流程同步清理 S3 原文件、缩略图和相关数据库记录，保持媒体与元数据一致。</p>'],
      ['订阅与跨云跟踪','<p>用户订阅指定物种并确认邮件后，后续识别命中该物种时，由 AWS SNS 发送通知；SES 作为 SNS 发布失败后的回退路径。系统同时向 OCI 传递 Cognito ID Token、接收方与短时有效的 S3 URL，形成跨云审计与冷副本记录。</p><p>通过重复检测、统一标签结构和事件驱动处理，减少重复存储与手工操作；将物种识别结果延伸到可持续跟踪的订阅闭环。</p>'],
      ['AI 辅助开发','<p>使用 Codex、Claude 辅助需求拆解、代码生成与重构、错误定位和部署调试。通过迭代 Prompt，将业务需求转化为 Python、REST API 与云端处理逻辑，并结合人工代码审查和端到端测试验证输出可靠性。</p>'],
      ['项目成果','<p>团队实现了<strong>认证 → 上传 → 自动识别 → 标签存储 → 条件查询 → 内容维护 → 订阅通知</strong>的完整数据闭环，并接通 AWS → OCI 的认证与审计路径。</p><p>我的工作重点是让 AI 处理能力进入可访问、可部署、可联调的应用：建立身份与接口边界，打通上传事件和云端服务，使用户能够从 Web UI 完成操作并取得一致的查询结果。</p>']
    ]
  }
};
const caseOrder = Object.keys(cases);
let currentCase = 'agent';
function renderCase(id) {
  const c = cases[id]; currentCase = id;
  $('#case-counter').textContent = c.label;
  $('#case-body').innerHTML = `<div class="case-hero"><span class="eyebrow">SELECTED CASE STUDY · ${String(caseOrder.indexOf(id)+1).padStart(2,'0')}</span><h2 id="case-title">${c.title}</h2><p>${c.intro}</p><div class="case-meta"><div><span>PERIOD / 时间</span><p>${c.period}</p></div><div><span>ROLE / 职责</span><p>${c.role}</p></div><div><span>TOOLS / 方法与工具</span><p>${c.tools}</p></div></div></div><div class="case-metrics">${c.metrics.map(m=>`<div><strong>${m[0]}</strong><p>${m[1]}</p></div>`).join('')}</div>${c.sections.map(s=>`<section class="case-article"><h3>${s[0]}</h3><div>${s[1]}</div></section>`).join('')}`;
  caseDialog.scrollTop = 0;
}
function openCase(id, updateHash = true) {
  if (!cases[id]) return;
  renderCase(id);
  if (!caseDialog.open) caseDialog.showModal();
  if (updateHash) history.replaceState(null, '', '#case-' + id);
  syncLock();
}
$$('[data-case]').forEach(button=>button.addEventListener('click',()=>openCase(button.dataset.case)));
$('#close-case').addEventListener('click',()=>caseDialog.close());
caseDialog.addEventListener('click',event=>{
  const r=caseDialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) caseDialog.close();
});
caseDialog.addEventListener('close',()=>{
  if (location.hash.startsWith('#case-')) history.replaceState(null,'','#work');
  syncLock();
});
$('#next-case').addEventListener('click',()=>{openCase(caseOrder[(caseOrder.indexOf(currentCase)+1)%caseOrder.length]);$('#close-case').focus();});
function handleHash(){if(location.hash.startsWith('#case-'))openCase(location.hash.slice(6),false);else if(caseDialog.open)caseDialog.close();}
addEventListener('hashchange',handleHash);handleHash();

// Professional capability profiles, drawn from the project responsibilities.
const skills = {
  monitor:{code:'01',category:'PERFORMANCE MONITORING',title:'让产能问题及时被看见。',summary:'围绕 9 个职场的坐席产能，设计持续监控与管理反馈机制，将分散的数据转化为可跟进的运营信号。',steps:['每日出单数据','连续条件识别','管理团队跟进'],rule:'每日识别连续 3 日出单不足 12 单的坐席，整理关注清单并推送至项目群，同步 BPO 管理团队开展后续处理。',impact:'把人工巡检转化为规则驱动的监控，支持跨职场的坐席产能管理。'},
  diagnosis:{code:'02',category:'LLM-ASSISTED DIAGNOSIS',title:'从数据变化，走向业务解释。',summary:'将多维量化分析与业务知识库结合，让归因结果以自然语言呈现，支持运营团队理解变化并判断下一步。',steps:['量化维度贡献','结合业务知识','形成归因与建议'],rule:'基于各维度对毛利变动的量化贡献，将分析数据输入 LLM，并结合业务知识库生成归因分析、趋势预判与优化建议。',impact:'把原需约 30 分钟的多维交叉归因，转化为一句自然语言问诊。'},
  report:{code:'03',category:'AUTOMATED REPORTING',title:'让经营信息按时抵达。',summary:'围绕核心经营指标，建立按时汇总与推送的流程，让团队在统一的信息基础上开展运营判断。',steps:['核心指标取数','统一汇总口径','按时推送团队'],rule:'负责每日 5 个时段的核心指标自动汇总与群内推送，连接数据整理、信息触达和经营监控。',impact:'减少重复整理工作，让经营监控融入团队日常节奏。'},
  attribution:{code:'04',category:'BUSINESS RULE DESIGN',title:'让跨职场数据口径保持一致。',summary:'针对坐席与订单归属不一致的情况，将业务判断固化为可执行规则，支持稳定、一致的数据统计。',steps:['识别归属差异','执行归因规则','统一统计对账'],rule:'将坐席职场与订单职场不一致时的归因逻辑固化为 Skill，明确跨职场场景的处理口径。',impact:'保障职场数据对账的准确性，让统计结果建立在统一规则之上。'}
};
function setSkill(id){
  const s=skills[id];
  $$('[data-skill]').forEach(b=>{const selected=b.dataset.skill===id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
  $('#skill-panel').setAttribute('aria-labelledby','skill-tab-'+id);
  $('#skill-code').textContent=s.code+' / 04';$('#skill-category').textContent=s.category;
  $('#skill-title').textContent=s.title;$('#skill-summary').textContent=s.summary;
  ['one','two','three'].forEach((word,i)=>$('#skill-step-'+word).textContent=s.steps[i]);
  $('#skill-rule').textContent=s.rule;$('#skill-impact').textContent=s.impact;
}
$$('[data-skill]').forEach((button,index)=>{
  button.addEventListener('click',()=>setSkill(button.dataset.skill));
  button.addEventListener('keydown',event=>{
    const tabs=$$('[data-skill]');let next=index;
    if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%tabs.length;
    else if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index-1+tabs.length)%tabs.length;
    else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
    event.preventDefault();tabs[next].focus();setSkill(tabs[next].dataset.skill);
  });
});
setSkill('monitor');

$('#copy-email').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText('liuziqi.eloise@gmail.com');$('#copy-status').textContent='邮箱已复制';}
  catch{$('#copy-status').textContent='请复制：liuziqi.eloise@gmail.com';}
});

// Decorative waveform with a fixed, non-data-bearing composition.
const wave=$('.waveform');
for(let i=0;i<45;i++){const bar=document.createElement('i');bar.style.height=`${10+Math.abs(Math.sin(i*.76)*Math.cos(i*.23))*85}px`;wave.appendChild(bar);}
