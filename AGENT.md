# 妖怪学習

## context
- あなたはReactエンジニアです。新たなサービスを実装しようとしています。

## rules
- plan first
- SOLID原則を守る
- use git, keep commiting
  - never use `git add -A`. add separately.
  - use conventional commit. separate commit for each targets or convetntional commit's type
    - see: https://www.conventionalcommits.org/en/v1.0.0/#summary
  - summarize diff for commit message 
- record your context to file(s)


## 目的
水木しげるロードのサイトにある各種妖怪の紹介ページから、以下の情報を抽出し、フラッシュカードのサービスを作る。
- ブロンズ像画像
- 妖怪名
- 読み(optional)
- 出現地
- 説明

### 情報形式
各ページには多数の妖怪情報が以下の形式で存在する。

**example** 
```html
<section class="section_box common_box statue_box">
<p class="img_box"><img class="filer_image " alt="二口女" src="/user/filer_public_thumbnails/filer_public/23/58/23586c47-a1a8-4ab9-ab92-2101b945391f/150.jpg__1020x765_q85_subsampling-2.jpg">
</p>

<div class="text_area">
<h3 class="simple">150. 二口女</h3>

<p class="border_text mab0 bottom_no">読み／<strong>ふたくちおんな</strong></p>

<p class="border_text">出現地／<strong>下総（千葉県北部、茨城県南西部）ほか</strong></p>

<p>食べ物を与えず継子を殺した女が二口女となる。口が前後にあって、食べる時には髪の先が蛇になり、後ろの口の箸のかわりをする。後の口に食べ物を与えないと、あらぬことをわめいて苦しめる。</p>
</div>
</section>```


### 対象ページ
- https://mizuki.sakaiminato.net/road/road_pages/yokai_forest/
- https://mizuki.sakaiminato.net/road/road_pages/yokai_gods/
- https://mizuki.sakaiminato.net/road/road_pages/yokai_near/
- https://mizuki.sakaiminato.net/road/road_pages/yokai_home/

## 仕様(spec)
- like Tinder, show 1 card at a time
  - images should be shown in square keeping its ratio
- first card shown without its name and image.
- when clicked. flips and shows its name and image. then clicked, go to the next card.
- remove number and spaces from its name
  - for example: 「82. 鬼太郎と目 玉 おやじ」 should be 「鬼太郎と目玉おやじ」
- mask its name in the description
  - sometimes includes spaces among names in description
  - its name ocassionally has aliases. it should be maintained by it's user with json
- show its keep original license at bottom with
   ```html
   <div class="license">
    <p class="ja">すべての画像・テキストの権利は取得元である<a href="https://mizuki.sakaiminato.net/road/">水木しげる記念館ホームページ</a>が保有しています。</p>
    <p class="en">all contents are originally keeped its license by <a href="https://mizuki.sakaiminato.net/road/">Mizuki Shigeru Memorial Museum</a>.</p>
   ``` 
- user can randomize the order
