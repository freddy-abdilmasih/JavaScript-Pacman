import { DIRECTIONS, OBJECT_TYPE } from './setup';

class Ghost {
    constructor(speed = 5, startPos, movement, name) {
        this.name = name; // name of ghost
        this.movement = movement;
        this.startPos = startPos; // starting position
        this.pos = startPos; // when Pacman eats a ghost, they return to the start position
        this.dir = DIRECTIONS.ArrowRight;
        this.speed = speed;
        this.timer = 0;
        this.isScared = false; // this turns to true when Pacman eats a power pill
        this.rotation = false; // ghosts don't rotate
    }

    shouldMove() {
        if (this.timer === this.speed) {
            this.timer = 0;
            return true;
        }
        this.timer++;
        return false;
    }

    getNextMove(objectExist) {
        const { nextMovePos, direction } = this.movement(
            this.pos,
            this.dir,
            objectExist
        );
        return { nextMovePos, direction };
    }

    makeMove() {
        const classesToRemove = [
            OBJECT_TYPE.GHOST,
            OBJECT_TYPE.SCARED,
            this.name,
        ];
        let classesToAdd = [OBJECT_TYPE.GHOST, this.name];

        if (this.isScared) classesToAdd = [...classesToAdd, OBJECT_TYPE.SCARED];

        return { classesToRemove, classesToAdd };
    }

    setNewPos(nextMovePos, direction) {
        this.pos = nextMovePos;
        this.dir = direction;
    }
}

export default Ghost;
