# GUARDIAN_CRISIS_DETECTION_V1

This document expands GraceFul Guardian crisis detection patterns so the product responds with support resources, not just a block screen. It is written for detection and triage only.

## Scope and safety guardrails

Guardian Crisis Detection is for self harm and suicide risk language only.

It must not:
* Show methods or instructions
* Suggest means, tools, or locations
* Generate personalized self harm plans

If a user asks for methods or instructions, the system must refuse and instead show crisis resources.

## Risk tiers

### High risk
Trigger the Crisis Protocol immediately when intent to self harm or suicide is expressed, especially with a near term or determined tone.

### Medium risk
Allow but privately show a support link when the message expresses worthlessness, hopelessness, or wanting to disappear, without clear intent.

### Low risk or non crisis
Allow with no intervention when phrases are clearly about stress, humor, idioms, or non self harm context.

## 1. Self harm and crisis stem expansion

Use these as pattern families. Prefer tokenized matching plus simple morphology rules rather than exact string matching.

### Core English stems and variations

| Root stem | Examples of variations |
| --- | --- |
| die | I want to die, I wish I was dead, better off if I die, I hope I die |
| kill self | kill myself, I will kill myself, gonna kill myself, kms |
| end it | end it all, end my life, end everything, end my suffering |
| no reason | no reason to live, nothing to live for, no reason to stay |
| disappear | I want to disappear, I want to vanish, I do not want to exist |
| not wake | I do not want to wake up, hope I do not wake up, never wake up |
| goodbye | goodbye everyone, goodbye world, this is my last message |

### Core Filipino and Taglish stems and variations

Notes:
* Include spelling noise and chat typos
* Include code switched versions

| Root stem | Examples of variations |
| --- | --- |
| ayoko na | ayoko na, ayoko na talaga, ayoko na sa lahat, ayoko na sa mundo |
| suko | suko na, suko na ko, suko na ako sa lahat |
| pagod | pagod na ko, pagod na pagod na ko, napapagod na ko mabuhay |
| gusto mamatay | gusto ko na mamatay, gusto ko nang mamatay, gusto ko na talaga mamatay |
| ayoko mabuhay | ayoko na mabuhay, ayoko nang mabuhay pa, ayoko na sa buhay |
| sana mamatay | sana mamatay na lang ako, sana mamatay na ako |
| wala silbi | wala na kong silbi, wala akong kwenta, walang kwentang tao |
| mawala | gusto ko na lang mawala, gusto ko na lang maglaho, gusto ko na lang mawala parang bula |
| di na magising | sana di na ako magising, ayoko na magising, di na ko gigising |
| magpakamatay | magpapakamatay, magpapakamatay na ako, magpapakamatay nalang ako |
| laslas | maglalaslas, maglaslas, laslasin ko, laslas |
| paalam | paalam na, paalam sa lahat, di niyo na ko makikita |

## 2. High risk phrases and patterns

These are phrasing patterns that should escalate immediately. They are written as examples, not an exhaustive list.

### English patterns
* I want to die
* I want to kill myself
* I am going to kill myself
* Goodbye everyone
* They are better off without me
* I have no reason to stay
* I do not want to live anymore
* I want to disappear forever
* I hope I do not wake up

### Filipino and Taglish patterns
* Ayoko na mabuhay
* Ayoko na talaga
* Suko na ko sa lahat
* Sana mamatay na lang ako
* Wala na kong silbi
* Magpapakamatay na ako
* Ayoko na Lord kunin mo na ako
* Ayoko nang umabot bukas
* Gusto ko na lang mawala

Examples of these phrases appear frequently in Philippine mental health support communities online. See Sources.

## 3. Guardian action logic

Crisis detection uses a different UX path from violent intent moderation.

| Detected state | Guardian action | UX response |
| --- | --- | --- |
| High risk | Flag and intercept | Show a modal that says you are not alone, then present call options for NCMH and Hopeline, plus a quick exit option |
| Medium risk | Allow and tag | Allow the post. Privately show a subtle help link and offer to connect to resources |
| Low risk or false positive | Allow | No crisis UI. Log as non crisis for model tuning |

Implementation notes:
* Always store a structured reason code such as CRISIS_HIGH_INTENT, CRISIS_MED_HOPELESSNESS, CRISIS_FALSE_IDIOM
* Rate limit crisis prompts per device to avoid spam while still prioritizing safety

## 4. Safety exceptions and context guards

These reduce false positives without weakening detection.

### Work and stress context
Examples:
* pagod sa school
* pagod sa trabaho
* pagod sa boss
* pagod sa traffic

### Idioms and hyperbole
Examples:
* I am dying for a nap
* I would kill for a burger
* patay ako kay mama
* nakamamatay yung pila

### Sleep but healthy
Examples:
* I need to sleep for 10 hours
* tulog ako maghapon

### Red flags in sleep framing
Escalate when sleep is framed as permanent or never waking:
* I want to sleep forever
* ayoko na magising
* sana di na ako magising

## 5. Expanded phrase bank from online usage

This section adds common variants seen in real posts and comments, especially in PH communities. These are examples for matching and should be implemented as normalized patterns.

### English and internet shorthand
* kms
* I cannot do this anymore
* I am done with life
* I want everything to stop
* I want out
* I do not want to exist
* I wish I could just disappear
* last message
* this is goodbye

### Filipino and Taglish colloquialisms
* ayoko na sa mundong to
* ayoko na sa earth
* pagod na pagod na ko
* ayoko na talaga mabuhay
* gusto ko na lang mawala
* gusto ko na lang maglaho
* ayoko na maramdaman to
* gusto ko mamatay sa birthday ko
* ayokong maging pabigat
* ayoko na maging pabigat
* sana kunin na lang ako
* Lord kunin mo na ako
* wala na akong gana sa lahat
* wala na kong dahilan
* wala akong dahilan para mabuhay
* gusto ko na lang di mag exist
* gusto ko na lang hindi na magising
* di ko na kaya
* hindi ko na kaya
* hindi ko na kaya to
* ayoko na, suko na

Notes on coverage:
* The phrase ayoko na appears constantly in both crisis and non crisis contexts. Treat it as a soft trigger unless paired with other crisis anchors such as mamatay, magpakamatay, di na magising, last message, goodbye, wala nang dahilan.

## 6. Suggested matching strategy

Avoid pure substring scanning. Use layered scoring.

### Step 1: Normalize
* lowercase
* remove repeated characters beyond 2
* normalize common chat variants such as ko, ako, nk, q, u
* map common Taglish spacing such as di na, d na, dina, dna

### Step 2: Detect anchors
Anchor groups:
* intent anchors: mamatay, kill myself, magpakamatay, laslas
* permanence anchors: forever, di na, never, wala nang
* farewell anchors: goodbye, paalam, last message
* hopelessness anchors: wala akong silbi, walang kwenta, no reason

### Step 3: Apply context guards
Suppress when:
* there is a clear work, school, traffic context
* the phrase is a known idiom

Escalate when:
* intent anchor plus permanence or farewell anchor
* multiple hopelessness anchors are present

### Step 4: Decide the UX response
Map score to High, Medium, Low.

## 7. Helplines and support resources

Numbers below are based on official pages. Verify occasionally since these can change.

### NCMH Crisis Hotline
* 1553
* 0917 899 8727
* 0966 351 4518
* 0919 057 1553
* 1800 1888 1553

### Hopeline Philippines
* 02 8804 4673
* 0917 558 4673
* 0918 873 4673

### In Touch Community Services Crisis Line
* 02 8893 7603
* 0919 056 0709
* 0917 800 1123
* 0922 893 8944

## 8. Master JSON for crisis code

```json
{
  "crisis_config": {
    "version": "v1",
    "hard_triggers": [
      "suicide",
      "kill myself",
      "i want to die",
      "end it all",
      "end my life",
      "magpapakamatay",
      "gusto ko na mamatay",
      "ayoko na mabuhay",
      "laslas",
      "ayoko na magising",
      "sana di na ako magising"
    ],
    "soft_triggers": [
      "ayoko na",
      "suko na",
      "pagod na ko",
      "pagod na pagod na ko",
      "goodbye",
      "paalam",
      "wala na kong silbi",
      "wala akong kwenta",
      "gusto ko na lang mawala",
      "di ko na kaya",
      "hindi ko na kaya"
    ],
    "context_guards": {
      "work_school_stress": [
        "tired of school",
        "tired of work",
        "pagod sa school",
        "pagod sa trabaho",
        "pagod sa boss",
        "pagod sa traffic"
      ],
      "idioms_hyperbole": [
        "dying for",
        "kill for a",
        "patay ako",
        "nakamamatay"
      ]
    },
    "helplines": {
      "NCMH": {
        "short_code": "1553",
        "toll_free": "1800 1888 1553",
        "mobile": ["0917 899 8727", "0966 351 4518", "0919 057 1553"]
      },
      "HopelinePH": {
        "landline": "02 8804 4673",
        "globe": "0917 558 4673",
        "smart": "0918 873 4673"
      },
      "InTouch": {
        "landline": "02 8893 7603",
        "mobile": ["0919 056 0709", "0917 800 1123", "0922 893 8944"]
      }
    }
  }
}
```

## 9. Sources

Helplines:
* NCMH hotline references: MentalHealthPH help page and public posts
* Hopeline numbers: HopelinePH public posts
* In Touch crisis line numbers: In Touch official contact page

Online language examples:
* r MentalHealthPH posts containing phrases such as gusto ko na mamatay, ayoko na, suko na, ayoko na maramdaman to
* r Philippines and other PH subreddits showing colloquial phrasing such as ayoko na sa earth

Reference links:
* https://mentalhealthph.org/help/
* https://www.facebook.com/ukinthephilippines/posts/diduknow-the-ncmh-crisis-hotline-gives-free-247-support-and-referrals-contact-th/1105946804899200/
* https://www.facebook.com/HopelinePH/videos/1443769466860471/
* https://in-touch.org/contact-us/
* https://www.reddit.com/r/MentalHealthPH/comments/18yj2wb/gusto_ko_na_mamatay/
* https://www.reddit.com/r/MentalHealthPH/comments/1b9m89v/ayoko_na_suko_na_ako_pagod_na_pagod_na_ako/
* https://www.reddit.com/r/MentalHealthPH/comments/1ofn2cx/ayoko_na/
* https://www.reddit.com/r/Philippines/comments/1dd50e1/what_are_the_famous_sm_stories_you_know/
