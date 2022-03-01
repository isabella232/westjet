function setClass(els, className) {
    els.forEach((el) => el.className = className);
}

export default async function decorate(block) {
    const tabs = [...block.children];
    const div = document.createElement('div');
    div.className = 'flights-switcher';
    div.innerHTML=`
    <span>Flights From</span>
    <span>Destination</span>
    <span>Flights</span>
    `;
    const spans = [...div.children];
    spans.forEach((span, i) => {
        span.addEventListener('click', () => {
            setClass(tabs, '');
            setClass(spans, '');
            spans[i].className = 'selected';
            tabs[i].className = 'selected';
        });
    })

    spans[0].className = 'selected';
    tabs[0].className = 'selected';

    block.prepend(div);
}