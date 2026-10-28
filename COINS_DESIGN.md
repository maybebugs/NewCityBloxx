# Coin system – design notes

## Goals
1. **Reward skill, never punish failure.** Coins are banked the instant they are earned; a collapsed tower still pays what you stacked.
2. **A purchase inside the first session.** Welcome gift (100) + first tower (50) puts the cheapest top within reach in minutes.
3. **Always something to chase.** Price ladder, a visible "next goal" bar, a collection counter and a daily streak give short, mid and long-term goals.
4. **One sink, no dead ends.** Coins only buy tops (cosmetic), so nothing is pay-to-win and nothing can soft-lock progress.

## Earning
| Source | Coins | Why |
|---|---|---|
| Block placed | 1 | Constant trickle: every drop feels rewarded |
| Perfect drop (offset < 25) | 2 | Doubles pay, so precision is the fastest way to earn |
| Combo payout (x3 and up) | combo count, max 10 | Skill multiplier on top of perfects |
| Finished city tower | 10 / 20 / 35 / 50 / 75 (blue, red, green, yellow, pink) | Scales with tower length and difficulty |
| Bonus roof | x1.5 of the tower payout | Rewards the hardest landing |
| Quick mode game over | 2 per 10 floors, +25 on a new floor record | Endless mode needs its own payout |
| City level L (once each) | 15 + 5·L | Progression pays too; existing saves get a one-time catch-up |
| Daily bonus (7-day streak) | 20, 30, 40, 60, 80, 100, **200** | Return habit; a missed day restarts the cycle (soft penalty, no loss of coins) |
| Welcome gift | 100 | First-launch hook |
| One-time firsts | first perfect 10, first tower 50, combo x5 20, quick 25/50/100/150 floors: 30/75/200/300 | Early dopamine, then long-term targets |

Typical pace: a blue tower ≈ 25–35 coins, a pink tower ≈ 150+, a quick run of 60 floors ≈ 100+. A casual day ≈ 150–300 coins.

Guards: no coins while the city cheat is active; the clock moving backwards gives no daily bonus; the daily bonus can't be claimed twice a day.

## Spending: the Store
* Unlocks are **global** (buy once, equip on any tower colour). A purchase auto-equips on the selected tower for an instant payoff.
* **Two-step purchase** (first press arms, second pays) prevents accidents. A model that fails to load is never charged.
* The list is the **price ladder**: Default (free) first, then cheapest to most expensive, so progress is always visible. Models you add yourself with the box button stay free and are listed last.
* Existing players keep every top they had equipped before the update.

### Price list (35 paid tops, 27,920 coins total)
| Tier | Price band | Role | Tops (price) |
|---|---|---|---|
| COMMON | ≤ 300 | Cheap, instantly readable; first purchase within session one | Copper Spud 100, Cone Blocker 120, Tall Cuke 120, Hoops 150, Match Point 150, Pigskin 150, Big Apple 180, Juicy Orange 180, Swirl Pile 200, Sugar Ring 220, Candy Cane 250, Candy Spiral 250, Velvet Bottle 300, Bonus Peach 300 |
| RARE | ≤ 800 | A few sessions of saving: nature, vehicles, sci-fi | Classic Bonus 400, Frost Knot 350, Signal Mast 400, Velvet Rose 450, Fluff Plug 500, Sky Peak 500, Pink Rocket 500, Star Wand 550, Jet Liner 600, Blue Marble 650, SD70ACe 700, Globemaster 750, Little Saucer 800 |
| EPIC | ≤ 2,000 | Skyline landmarks, tall iconic silhouettes; mid-term goals | Old Clock 900, Watchtower 1,100, Tokyo Tower 1,400, Lady Liberty 1,700, Heaven Gate 2,000 |
| LEGENDARY | > 2,000 | Status symbols with twinkling previews; long-term flex | Block Devil 2,500, Gold Crown 3,500, Ice Gem 5,000 |

Prices live in `CustomTops.CATALOG` (js/game/CustomTops.js); earning values in `Coins.R` (js/game/Coins.js). Retune there.

## Retention hooks in the UI
* Reward banner + flying coins into the HUD counter (counter ticks up as coins land).
* Store: price strip turns **red** when unaffordable, "Need N more coins", and a gold goal bar that pulses when you can buy.
* When the focused top is owned, the bar shows the **next cheapest unowned top**.
* Collection counter (owned / 35).

## Ideas for later
Daily missions, a coin multiplier for streak days, per-tower-colour unlock bundles, rewarded "double your payout" hooks.

## Files
`tools/make_coin_sprite.py` (sprites, palette sampled from the game), `tools/add_assets.py` (injects them into assets.js), `tools/patch_coins.py` (game hooks, idempotent), `js/game/Coins.js`, `js/game/StoreScreen.js`, `js/game/CustomTops.js`.
