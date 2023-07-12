//Life game

window.sleep = (ms) => new Promise(r => ms == 0 ? r() : setTimeout(r, ms));
Promise.prototype.sleep = async function(ms) {
    await this;
    return await sleep(ms);
};

(function(){
    /*     config     */
    var width = 150,
        height = 30,
        target_fps = 60,
    /*     Do not modify     */
        time_per_frame = 1000 / target_fps,
        frame_count = 0,
        real_fps = 0,
        map = Array(height).fill(Array(width).fill(0));

    window.respawn = () => !(map = map.map(line=>line.map(()=>Math.random()>.5)))

	var render_method = () => {
        frame_count++
		map = map.map((line, y) =>
            line.map((point, x) =>
                (count => (count == 2 && point) || count == 3)(
                    [[x-1, y-1], [x, y-1], [x+1, y-1],
                     [x-1, y], /* [x, y] */, [x+1, y],
                     [x-1, y+1], [x, y+1], [x+1, y+1]]
                    .map(_ => map[_[1]] ? map[_[1]][_[0]] ?? 0 : 0)
                    .reduce((a,b)=>a+b)
                )
            )
        )
        document.body.innerText = `fps: ${real_fps}, max-fps: ${target_fps}\n` +
            map.map((line, y)=>(y<10?'0'+y:y)+line.map(i=>i?'◼':'◻').join('')).join('\n')
	}
	var render = () => sleep(time_per_frame).then(render_method).then(render)

    respawn();
    render();
    setInterval(() => [real_fps, frame_count] = [frame_count, 0], 1000)
})();


